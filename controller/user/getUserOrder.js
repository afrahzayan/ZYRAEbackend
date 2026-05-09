const orderModel = require("../../model/orderModel");

const getUserOrders = async (req, res) => {

    try {

        const userId = req.user.userID;

        const orders = await orderModel
            .find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (err) {

        console.log("GET ORDERS ERROR:", err);

        res.status(500).json({
            success: false,
            message: "Error fetching orders",
            error: err.message
        });
    }
};

module.exports = getUserOrders;