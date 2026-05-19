const userModel = require("../../model/userModel");
const productModel = require("../../model/productModel");
const orderModel = require("../../model/orderModel");


const getAdminDashboard = async (req, res) => {
  try {

    const [users, products, totalOrders] = await Promise.all([
      userModel.find(),
      productModel.find(),
      orderModel.countDocuments()

    ]);



    // TOTAL REVENUE
    const revenueData = await orderModel.aggregate([

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$totalAmount"
          }
        }
      }

    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;



    // MONTHLY REVENUE
    const monthlyRevenue = await orderModel.aggregate([

      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt"
            },
            year: {
              $year: "$createdAt"
            }
          },
          revenue: {
            $sum: "$totalAmount"
          }
        }
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      },

      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          revenue: 1

        }
      }
    ]);



    // ORDER STATUS
    const orderStatusData = await orderModel.aggregate([

      {
        $group: {
          _id: "$status",
          value: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0,
          name: "$_id",
          value: 1

        }
      }

    ]);



    // WEEKLY ORDERS

    const weeklyOrdersData = await orderModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(
              new Date().setDate(
                new Date().getDate() - 7
              )
            )
          }
        }
      },

      {
        $group: {
          _id: {
            $dayOfWeek: "$createdAt"
          },

          orders: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          _id: 1
        }
      },

      {
        $project: {
          _id: 0,
          day: {

            $switch: {
              branches: [
                {
                  case: {
                    $eq: ["$_id", 1]
                  },
                  then: "Sun"
                },

                {
                  case: {
                    $eq: ["$_id", 2]
                  },
                  then: "Mon"
                },

                {
                  case: {
                    $eq: ["$_id", 3]
                  },
                  then: "Tue"
                },

                {
                  case: {
                    $eq: ["$_id", 4]
                  },
                  then: "Wed"
                },

                {
                  case: {
                    $eq: ["$_id", 5]
                  },
                  then: "Thu"
                },

                {
                  case: {
                    $eq: ["$_id", 6]
                  },
                  then: "Fri"
                },

                {
                  case: {
                    $eq: ["$_id", 7]
                  },
                  then: "Sat"
                }
              ]
            }
          },

          orders: 1

        }
      }

    ]);



    res.status(200).json({

      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders,
      totalRevenue,
      revenueChartData: monthlyRevenue,
      orderStatusData,
      weeklyOrdersData

    });

  }

  catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Dashboard fetch failed"
    });

  }

};

module.exports = {
  getAdminDashboard
};