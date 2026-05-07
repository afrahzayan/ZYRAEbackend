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

    const existingUser = await userModel.findOne({ email });

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
            return res.status(400).json({ message: "eamil is required" });
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
      password: parsedData.password
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
        sameSite: "none"
      })
      .cookie("Refresh_Token", RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none"
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





const loginController = async (req, res) => {
    try {
        const { email, password } = req.body

        const isUser = await userModel.findOne({ email }).select("+password")

        if (!isUser) {
            return res.status(401).json({ message: "invalid email or password" })
        }

        if (isUser.Blocked) {
            return res.status(403).json({ message: "access denied. please try again later" }); 5
        }


        const isvalid = await bcrypt.compare(password, isUser.password)

        if (!isvalid) {
            return res.status(401).json({ message: "invalid password" })
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
                sameSite: "none",
            })

            .cookie("Refresh_Token", RefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
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

    return res.status(e.status || 500).json({
      message: e.message,
    });
  }
};




const getLoginUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ Message: "Unauthorized" });
    }

    const userData = await userModel.findOne({ _id: req.user.userID });

    res.status(200).json({
      Message: "User found",
      UserData: userData,
    });
  } catch (e) {
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
        sameSite: "none"
      })
      .clearCookie("Refresh_Token", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
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




module.exports = { registrationController,
     loginController,
      resendOtpController,
      verifyOtpController,
      loginController,
      getLoginUser,
     logoutController }