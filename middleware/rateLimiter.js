const rateLimit = require("express-rate-limit")


const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many attempts, try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});




const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests, try again later"
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    otpLimiter
};