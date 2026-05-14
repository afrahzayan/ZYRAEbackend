const orderModel = require("../../model/orderModel");

const getUserOrders = async (req, res) => {
  try {

    const userId = req.user.userID;

    const orders = await orderModel
      .find({ user: userId })

      .populate({
        path: "items.product",
        select: "name image price",
        options: {
          skipDeletedFilter: true
        }
      })

      .sort({ createdAt: -1 })

      .lean();

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (err) {

    console.error("getUserOrders error:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });

  }
};

module.exports = getUserOrders;