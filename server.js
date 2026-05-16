const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db.js");
const { connectRedis } = require("./config/redis.js");

const app = express();

const PORT = process.env.PORT ;

// USER
const userRoute = require("./routes/user/userRoutes.js");
const productRoute = require("./routes/user/productRoute.js");
const cartRoute = require("./routes/user/cartRoute.js");
const wishListRoute = require("./routes/user/wishListRoute.js");
const orderRoute = require("./routes/user/orderRoute.js");
const stripeWebhook = require("./controller/user/stripeWebhook.js")

// ADMIN
const productRouteAdmin = require("./routes/admin/productRoute.js");
const userRouteAdmin = require("./routes/admin/userRoute.js")
const orderRouteAdmin = require("./routes/admin/orderRoute.js")
const dashboardRoute = require('./routes/admin/dashboardRoute.js')
// WEBHOOK FIRST
app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }), stripeWebhook);

// NORMAL MIDDLEWARES
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "https://zyra-efrontend.vercel.app",
    credentials: true,
  })
);

//USER
app.use("/api/auth", userRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/wishList", wishListRoute);
app.use("/api/orders", orderRoute);


//ADMIN
app.use("/api/admin/product", productRouteAdmin);
app.use("/api/admin/user",userRouteAdmin);
app.use("/api/admin/orders",orderRouteAdmin);
app.use("/api/admin/dashboard",dashboardRoute)

//SERVER
const startServer = async () => {
  try {

    await connectDB();

    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server Running on Port ${PORT}`);
    });

  } catch (e) {

    console.log("Server start error:", e.message);

    process.exit(1);
  }
};

startServer();