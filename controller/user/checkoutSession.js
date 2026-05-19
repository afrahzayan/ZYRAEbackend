const Stripe = require("stripe");
const orderModel = require("../../model/orderModel");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



const createCheckoutSession = async (req, res) => {
  try {

    const userId = req.user.userID
    const {
      items,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount,
      paymentMethod,
      userEmail,
      userName,
      userPhone
    } = req.body;


    

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    if (!userEmail || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }


  
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name
        },
        unit_amount: Number(item.price) * 100

      },

      quantity: item.quantity

    }));


    

    const session =
      await stripe.checkout.sessions.create({
        payment_method_types: ["card", "upi"],
        lineItems,
        mode: "payment",

        success_url:
          `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${process.env.CLIENT_URL}/payment-cancel`,

        customer_email: userEmail,

        metadata: {
          userId
        }

      });


    
     // order
    await orderModel.create({

      orderNumber:
        `STR-${Date.now()}`,

      user: userId,

      userName,
      userEmail,
      userPhone,
      items: items.map((item) => ({
      product:
          item.productId || item.id,

        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size

      })),

      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount:Number(totalAmount),
      paymentMethod:paymentMethod || "online",
      stripeSessionId:session.id,
      paymentStatus: "pending",
      status: "processing"

    });


    res.status(200).json({
      success: true,
      url: session.url
    });

  }

  catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message

    });
  }
};

module.exports = createCheckoutSession;