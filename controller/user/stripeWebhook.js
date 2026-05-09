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

    return res.status(400).send(
      `Webhook Error: ${err.message}`
    );
  }

  // PAYMENT SUCCESS
  if (event.type === "checkout.session.completed") {

    const session = event.data.object;


const order = await orderModel.findOne({
  stripeSessionId: session.id
});

if (order && order.paymentStatus !== "paid") {

  for (const item of order.items) {

    const product = await productModel.findById(
      item.productId
    );

    if (product) {

      product.stock = Math.max(
  0,
  product.stock - item.quantity
);

      await product.save();
    }
  }

  order.paymentStatus = "paid";

  await order.save();
}
  }

  res.json({
    received: true
  });
};

module.exports = stripeWebhook;