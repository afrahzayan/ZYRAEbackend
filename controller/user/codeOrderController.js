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
      totalAmount
    } = req.body;



    if (!items || items.length === 0) {

      return res.status(400).json({
        success: false,
        error: "Cart is empty"
      });
    }



    const formattedItems = items.map((item) => ({
      product: item.product._id || item.product,
      quantity: item.quantity,
      price: item.price
    }));



    const newOrder = await orderModel.create({

      orderNumber: `COD-${Date.now()}`,

      user: userId,

      items: formattedItems,

      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,

      totalAmount,

      paymentMethod: "cod",

      paymentStatus: "pending",

      status: "pending_cod"
    });



    res.status(200).json({
      success: true,
      orderId: newOrder._id
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = createCodOrder;