const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userModel = require("../../model/userModel")
const generateToken = require("../../utils/generateToken")
const { sendOtp, verifyOtp } = require("../../service/otpController")
const { client } = require("../../config/redis")
require("dotenv").config()

const registrationController = async (req, res) => {
    try {
        const { fname, lname, email, password } = req.body;

        const existingUser = await userModel.findOne({ email, isDeleted: false });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await client.set(
            `register:${email}`,
            JSON.stringify({
                fname,
                lname,
                email,
                password: hashedPassword
            }),
            {
                EX: 900
            }
        );

        const result = await sendOtp(email);

        if (!result.success) {
            return res.status(400).json({
                message: "Failed to send OTP"
            });
        }

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server Error"
        });
    }
};

const resendOtpController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "email is required" });
        }

        const result = await sendOtp(email);

        if (!result.success) {
            return res.status(400).json({ message: "Failed to resend OTP" });
        }
        res.status(200).json({ message: "OTP Send Successfully" });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
};

const verifyOtpController = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP required"
            });
        }

        const result = await verifyOtp(email, otp);

        if (!result.success) {
            return res.status(400).json({
                message: result.message
            });
        }

        const userData = await client.get(`register:${email}`);

        if (!userData) {
            return res.status(400).json({
                message: "Registration expired"
            });
        }

        const parsedData = JSON.parse(userData);

        const newUser = await userModel.create({
            fname: parsedData.fname,
            lname: parsedData.lname,
            email: parsedData.email,
            password: parsedData.password,
            blocked: false  // Explicitly set blocked to false
        });

        await client.del(`register:${email}`);

        const { AccessToken, RefreshToken } = generateToken(
            newUser.email,
            newUser._id,
            newUser.role
        );

        return res
            .status(201)
            .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .json({
                success: true,
                message: "User registered successfully",
                user: {
                    fname: newUser.fname,
                    lname: newUser.lname,
                    email: newUser.email,
                    role: newUser.role
                }
            });

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Server Error"
        });
    }
};

// FIXED LOGIN CONTROLLER
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user with password field
        const isUser = await userModel.findOne({
            email,
            isDeleted: false
        }).select("+password");
        if (!isUser) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // FIX: Use 'blocked' (lowercase b) not 'Blocked'
        if (isUser.blocked) {
            return res.status(403).json({ message: "Access denied. Your account has been blocked." });
        }

        const isValid = await bcrypt.compare(password, isUser.password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const { RefreshToken, AccessToken } = generateToken(
            isUser.email,
            isUser._id,
            isUser.role
        );

        return res.status(200)
            .cookie("Access_Token", AccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
            })
            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "None",
            })
            .json({
                message: "Login successful",
                role: isUser.role,
                fname: isUser.fname,
                lname: isUser.lname,
                email: isUser.email,
            });

    } catch (e) {
        console.error("LoginController error:", e.message);
        return res.status(500).json({
            message: "Server error during login",
        });
    }
};

const getLoginUser = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ Message: "Unauthorized" });
        }

        // Get user ID from multiple possible locations
        const userId = req.user.userID || req.user.id;

        const userData = await userModel.findOne({
            _id: userId,
            isDeleted: false
        });
        if (!userData) {
            return res.status(404).json({ Message: "User not found" });
        }

        res.status(200).json({
            Message: "User found",
            UserData: userData,
        });
    } catch (e) {
        console.error("Error in getLoginUser:", e);
        res.status(500).json({
            Message: "Error in GetLoginUser",
            Error: e.message,
        });
    }
};

const logoutController = async (req, res) => {
    try {
        res
            .clearCookie("Access_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .clearCookie("Refresh_Token", {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            })
            .status(200)
            .json({
                message: "Logout successful"
            });

    } catch (e) {
        return res.status(500).json({
            message: "Logout Error"
        });
    }
};




// FIXED EXPORTS (removed duplicate loginController)
module.exports = {
    registrationController,
    loginController,
    resendOtpController,
    verifyOtpController,
    getLoginUser,
    logoutController,
    
};