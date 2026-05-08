
const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/db.js");
const { connectRedis } = require("./config/redis.js");

const app = express();

const PORT = process.env.PORT || 5000;

// Routes
const userRoute = require("./routes/user/userRoutes.js");
const productRoute = require("./routes/user/productRoute.js")
const cartRoute = require("./routes/user/cartRoute.js")
const wishListRoute= require("./routes/user/wishListRoute.js")

const productRouteAdmin = require("./routes/admin/productRoute.js")

app.use(express.json())

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173", // frontend URL
        credentials: true,
    })
);


app.use("/api/auth", userRoute);
app.use("/api/product",productRoute);
app.use("/api/admin/product",productRouteAdmin);
app.use("/api/cart",cartRoute);
app.use("/api/wishList",wishListRoute)

// Start Server
const startServer = async () => {
    try {
        // MongoDB Connection
        await connectDB();

        // Redis Connection
        await connectRedis();

        // Start Express Server
        app.listen(PORT, () => {
            console.log(`Server Running Successfully on Port ${PORT}`);
        });

    } catch (e) {
        console.log("Server start error:", e.message);
        process.exit(1);
    }
};

startServer();

