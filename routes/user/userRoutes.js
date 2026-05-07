const express = require("express")
const route = express.Router()
const {validate} = require("../../middleware/validate")
const loginValidate = require("../../validators/loginValidate")
const registerValidate = require("../../validators/registerValidate")
const {registrationController,
     loginController,
     getLoginUser,
     logoutController,
     verifyOtpController,
     resendOtpController} = require("../../controller/user/userController")
const protectRoutes = require("../../middleware/protectRout")
const tokenRegenerator = require("../../service/tokenRegenerate")
const verifyOtpValidate= require("../../validators/otpValidate")
const {authLimiter,otpLimiter} = require("../../middleware/rateLimiter")




route.post("/register", authLimiter,validate(registerValidate) ,registrationController);
route.post("/verify-otp",authLimiter,validate(verifyOtpValidate),verifyOtpController);
route.post("/resend-otp",otpLimiter, resendOtpController)
route.post("/login",authLimiter , validate(loginValidate),loginController);
route.post("/logout",protectRoutes,logoutController);
route.post("/refresh",tokenRegenerator)
route.get("/getUser",protectRoutes,getLoginUser)

module.exports = route