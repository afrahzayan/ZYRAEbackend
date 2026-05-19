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

  
  res.json({ received: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const order = await orderModel.findOne({ stripeSessionId: session.id });

      if (!order) {
        console.error(`Webhook: No order found for Stripe session ${session.id}`);
        return;
      }

      if (order.paymentStatus === "paid") {
        console.log(`Webhook: Order ${order._id} already marked paid — skipping`);
        return;
      }

    
      order.paymentStatus = "paid";
      order.status = "processing";
      await order.save();

   
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