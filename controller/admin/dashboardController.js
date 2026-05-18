const userModel = require("../../model/userModel");
const productModel = require("../../model/productModel");
const orderModel = require("../../model/orderModel");

const getAdminDashboard = async (req, res) => {
  try {

    const [users, products, orders] = await Promise.all([
      userModel.find(),
      productModel.find(),
      orderModel
        .find()
        .populate("user", "fname lname email")
        .sort({ createdAt: -1 })
    ]);

    // TOTAL REVENUE
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    );

   
   

    // MONTHLY REVENUE
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const currentDate = new Date();

    const monthlyRevenue = Array(6)
      .fill(0)
      .map((_, index) => {

        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - index,
          1
        );

        return {
          month: months[date.getMonth()],
          year: date.getFullYear(),
          revenue: 0
        };

      })
      .reverse();

    orders.forEach((order) => {

      const orderDate = new Date(order.createdAt);

      const orderMonth = orderDate.getMonth();

      const orderYear = orderDate.getFullYear();

      const monthIndex = monthlyRevenue.findIndex(
        (m) =>
          m.month === months[orderMonth] &&
          m.year === orderYear
      );

      if (monthIndex !== -1) {
        monthlyRevenue[monthIndex].revenue +=
          order.totalAmount || 0;
      }
    });

    // ORDER STATUS
    const statusCounts = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach((order) => {

      const status = order.status?.toLowerCase();

      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    const orderStatusData = [
      {
        name: "Processing",
        value: statusCounts.processing
      },
      {
        name: "Shipped",
        value: statusCounts.shipped
      },
      {
        name: "Delivered",
        value: statusCounts.delivered
      },
      {
        name: "Cancelled",
        value: statusCounts.cancelled
      }
    ];

    // WEEKLY ORDERS
    const days = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ];

    const weeklyOrdersData = days.map((day) => ({
      day,
      orders: 0
    }));

    orders.forEach((order) => {

      const date = new Date(order.createdAt);

      const dayIndex = date.getDay();

      weeklyOrdersData[dayIndex].orders += 1;
    });

    res.status(200).json({
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,

      

      revenueChartData: monthlyRevenue,
      orderStatusData,
      weeklyOrdersData
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });
  }
};

module.exports = {
  getAdminDashboard
};