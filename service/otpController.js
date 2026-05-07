const transporter = require("../config/mail");
const generateOtp = require("../utils/generateOtp")
const { client } = require("../config/redis")
require("dotenv").config()


const sendOtp = async (email) => {
    try {

        email = email.trim().toLowerCase();

        const otp = generateOtp();

        console.log("Saving Key:", `otp:${email}`);

        await client.set(
            `otp:${email}`,
            otp,
            {
                EX: 600
            }
        );

        const checkOtp = await client.get(`otp:${email}`);

        console.log("Saved OTP:", checkOtp);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}`
        });

        return {
            success: true
        };

    } catch (err) {

        console.log("send otp error", err);

        return {
            success: false,
            message: "Failed to send OTP"
        };
    }
};


const verifyOtp = async (email, userOtp) => {

    try {

        email = email.trim().toLowerCase();

        console.log("Searching Key:", `otp:${email}`);

        const storedOtp = await client.get(`otp:${email}`);

       
        if (!storedOtp) {
            return {
                success: false,
                message: "OTP expired"
            };
        }

        if (storedOtp.toString() === userOtp.toString()) {

            await client.del(`otp:${email}`);

            return {
                success: true
            };
        }

        return {
            success: false,
            message: "Invalid OTP"
        };

    } catch (err) {

        console.log("verify OTP Error:", err);

        return {
            success: false,
            message: "Something Went Wrong"
        };
    }
};

module.exports = { sendOtp, verifyOtp }