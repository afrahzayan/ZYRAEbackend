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
      userEmail,
      userName,
      userPhone,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    if (!userEmail || !totalAmount) {
      return res.status(400).json({ success: false, message: "Missing required fields: userEmail, totalAmount" });
    }

    // At this point items are FLAT (normalized by the frontend's normalizeCartItem):
    //   { productId, name, price, image, quantity, size? }
    // Validate each item has the minimum required fields before touching Stripe.
    for (const item of items) {
      if (!item.name || item.price == null) {
        return res.status(400).json({
          success: false,
          message: `Cart item is missing name or price: ${JSON.stringify(item)}`,
        });
      }
    }

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          // Stripe only accepts publicly reachable absolute URLs.
          // Omit images entirely if the URL is relative or missing.
          ...(item.image && item.image.startsWith("http")
            ? { images: [item.image] }
            : {}),
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "upi"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/payment-cancel`,
      customer_email: userEmail,
      metadata: { userId: userId.toString() },
    });

    // Save the order as "pending" NOW so the webhook can find it by stripeSessionId.
    // The webhook marks it "paid" after checkout.session.completed fires.
    // Items are stored with name/image so the Orders page can display them
    // without needing to re-populate from the product collection.
    const formattedItems = items.map((item) => ({
      product:  item.productId || item.id,
      name:     item.name,
      image:    item.image,
      quantity: item.quantity,
      price:    parseFloat(item.price),
      ...(item.size ? { size: item.size } : {}),
    }));

    await orderModel.create({
      orderNumber:     `STR-${Date.now()}`,
      user:            userId,
      userName,
      userEmail,
      userPhone,
      items:           formattedItems,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount:     parseFloat(totalAmount),
      paymentMethod:   paymentMethod || "online",
      stripeSessionId: session.id,
      paymentStatus:   "pending",
      status:          "processing",
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createCheckoutSession;