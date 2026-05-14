const orderModel = require("../../model/orderModel");

const createCodOrder = async (req, res) => {
  try {
    const userId = req.user.userID;

    const {
      items,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      totalAmount,
      userName,
      userEmail,
      userPhone,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }
    if (!totalAmount || !shippingAddress || !shippingCity) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Items arrive flat from the frontend's normalizeCartItem():
    //   { productId, name, price, image, quantity, size? }
    // Store name and image directly on the order so the Orders page can
    // render items without re-populating from the product collection.
    const formattedItems = items.map((item) => ({
      product:  item.productId || item.id,
      name:     item.name,
      image:    item.image,
      quantity: item.quantity,
      price:    parseFloat(item.price),
      ...(item.size ? { size: item.size } : {}),
    }));

    const newOrder = await orderModel.create({
      orderNumber:     `COD-${Date.now()}`,
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
      paymentMethod:   "cod",
      paymentStatus:   "pending",
      status:          "processing",
    });

    res.status(201).json({ success: true, orderId: newOrder._id });
  } catch (error) {
    console.error("createCodOrder error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = createCodOrder;