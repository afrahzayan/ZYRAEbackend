const orderModel = require("../../model/orderModel");

const createCodOrder = async (req, res) => {
  try {
    const userId = req.user.userID;
    const orderData = req.body;
    
    // Save order to database
    const newOrder = await orderModel.create({
      orderNumber: `COD-${Date.now()}`,
      userId: userId,
      userName: orderData.userName,
      userEmail: orderData.userEmail,
      userPhone: orderData.userPhone,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      shippingCity: orderData.shippingCity,
      shippingState: orderData.shippingState,
      shippingZip: orderData.shippingZip,
      totalAmount: orderData.totalAmount,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "pending_cod"
    });
    
    res.status(200).json({ 
      success: true, 
      orderId: newOrder._id 
    });
    
  } catch (error) {
    console.error("COD ORDER ERROR:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = createCodOrder;