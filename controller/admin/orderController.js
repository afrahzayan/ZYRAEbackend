const orderModel = require("../../model/orderModel");

// -----------------------------------------------------
// GET ALL ORDERS (ADMIN)
// -----------------------------------------------------

const fetchAllOrders = async (req, res) => {
  try {

    const { status, search } = req.query;

    const filter = {};

    // Filter by order status
    if (status) {
      filter.status = status;
    }

    const orders = await orderModel

      .find(filter)

      .populate({
        path: "user",
        match: search
          ? {
              name: {
                $regex: search,
                $options: "i",
              },
            }
          : {},
        select: "name email",
      })

      .populate({
        path: "items.product",
        select: "name image price",
      })

      .sort({ createdAt: -1 })

      .lean();

    // remove orders where user not matched
    const filteredOrders = orders.filter((order) => order.user);

    res.status(200).json({
      success: true,
      totalOrders: filteredOrders.length,
      data: filteredOrders,
    });

  } catch (error) {

    console.log("fetchAllOrders error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });

  }
};

// -----------------------------------------------------
// GET SINGLE USER ORDERS
// -----------------------------------------------------

const specificUserOrderList = async (req, res) => {
  try {

    const { id } = req.params;

    const orders = await orderModel

      .find({ user: id })

      .populate({
        path: "user",
        select: "name email",
      })

      .populate({
        path: "items.product",
        select: "name image price",
      })

      .sort({ createdAt: -1 })

      .lean();

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {

    console.log("specificUserOrderList error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
    });

  }
};

// -----------------------------------------------------
// UPDATE ORDER STATUS
// -----------------------------------------------------

const updateOrderStatus = async (req, res) => {
  try {

    const { id } = req.params;

    const { status } = req.body;

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    // Payment status update
    if (status === "delivered") {

      order.paymentStatus = "paid";

    } else if (status === "cancelled") {

      order.paymentStatus = "failed";

    } else {

      if (order.paymentMethod === "COD") {
        order.paymentStatus = "pending";
      }

    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });

  } catch (error) {

    console.log("updateOrderStatus error:", error);

    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });

  }
};

module.exports = {
  fetchAllOrders,
  specificUserOrderList,
  updateOrderStatus,
};