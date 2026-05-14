const Stripe = require("stripe");
const orderModel = require("../../model/orderModel");
const productModel = require("../../model/productModel");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Acknowledge immediately — Stripe requires a fast 2xx response.
  // If we do DB work before responding, Stripe may time out and retry,
  // causing the event to be processed twice.
  res.json({ received: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const order = await orderModel.findOne({ stripeSessionId: session.id });

      if (!order) {
        console.error(`Webhook: No order found for Stripe session ${session.id}`);
        return;
      }

      // Idempotency guard — Stripe may deliver the same event more than once
      if (order.paymentStatus === "paid") {
        console.log(`Webhook: Order ${order._id} already marked paid — skipping`);
        return;
      }

      // Mark paid FIRST so the order is in a valid state even if stock
      // updates fail partway through
      order.paymentStatus = "paid";
      order.status = "processing";
      await order.save();

      // Decrement stock per item; isolate failures so one bad product
      // doesn't block the rest
      for (const item of order.items) {
        try {
          const product = await productModel.findById(item.product);
          if (product) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
          } else {
            console.warn(`Webhook: Product ${item.product} not found — stock not updated`);
          }
        } catch (stockErr) {
          console.error(`Webhook: Stock update failed for product ${item.product}:`, stockErr);
        }
      }

      console.log(`Webhook: Order ${order._id} marked paid, stock updated`);
    } catch (err) {
      console.error(`Webhook: Failed to handle checkout.session.completed (session ${session.id}):`, err);
    }
  }
};

module.exports = stripeWebhook;