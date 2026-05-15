const orderModel = require("../../model/orderModel");


// GET ALL ORDERS (ADMIN)
const getAllOrders = async (req, res) => {
  try {

    const orders = await orderModel
      .find()
      .populate("user")
      .sort({ createdAt: -1 });

    // FORMAT DATA FOR FRONTEND
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),      orderNumber: order.orderNumber,
      userName: order.user?.fname || "Unknown User",
      userEmail: order.user?.email || "No Email",
      orderDate: order.createdAt,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      status: order.status
    }));

    res.status(200).json(formattedOrders);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch orders"
    });
  }
};



// UPDATE ORDER STATUS (ADMIN)
const updateOrderStatus = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      updatedOrder
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update order status"
    });
  }
};



module.exports = {
  getAllOrders,
  updateOrderStatus
};