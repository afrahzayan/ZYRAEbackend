const Stripe = require("stripe");
const orderModel = require("../../model/orderModel");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {

    const userId = req.user.userID;

    const {
      items,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount,
      paymentMethod,
      userName,
      userEmail,
      userPhone
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",

        product_data: {
          name: item.name,
          images: [item.image]
        },

        unit_amount: Math.round(item.price * 100)
      },

      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({

      payment_method_types: [
  "card",
  "upi"
],

      line_items,

      mode: "payment",

      success_url:
        `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${process.env.CLIENT_URL}/payment-cancel`,

      customer_email: userEmail,

      metadata: {
  userId: userId.toString()
}
    });

    // Save order
    const newOrder = await orderModel.create({

        orderNumber: `ORD-${Date.now()}`,

      userId,
      userName,
      userEmail,
      userPhone,
      items,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount,
      paymentMethod,
      stripeSessionId: session.id,
      paymentStatus: "pending",
      status: "processing"
    });

    res.status(200).json({
      success: true,
      url: session.url
    });

  } catch (error) {

    console.log("CHECKOUT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = createCheckoutSession;