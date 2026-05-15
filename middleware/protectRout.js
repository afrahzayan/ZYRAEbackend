const jwt = require("jsonwebtoken");
require('dotenv').config();
const userModel = require("../model/userModel");

const protectRoutes = async (req, res, next) => {
    try {
        let token = req.cookies?.Access_Token;
        
          
        if (!token) {
            return res.status(401).json({ Message: "Unauthorized, Please Login First" });
        }
        
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        console.log("Decoded token:", decode);
        
        const user = await userModel.findById(decode.Id);
        console.log("User found:", user ? "Yes" : "No");
        console.log("User ID:", user?._id?.toString());

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.blocked) {
            return res.status(403).json({ message: "Access denied. You are blocked by admin." });
        }

        // SETTING REQ.USER
        req.user = {
            id: user._id,
            userID: user._id,
            _id: user._id,
            Email: user.email,
            role: user.role,
            blocked: user.blocked,
        };
        
        
        
        next();

    } catch (e) {
        console.error("Protect Route Error:", e.message);
        res.status(401).json({ message: "Protect Router Issue", Error: e.message });
    }
};

module.exports = protectRoutes;