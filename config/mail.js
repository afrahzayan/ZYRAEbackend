const nodemailer = require("nodemailer")
require("dotenv").config()

const tarnsported = nodemailer.createTransport({
    // host: "smtp.gmail.com",
    // port: 587,
    // secure: false,
    service: "gmail",
    auth: {
        user:process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

})
module.exports = transporter
