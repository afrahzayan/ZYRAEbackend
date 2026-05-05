const transporter = require("../config/mail");
const generateOtp = require("../utils/generateOtp")
const {client} = require("../config/redis")
require("dotenv").config()


const sendOtp = async (email) => {
    try{
        const existingOtp = await client.get(`otp:${email}`);
        if(existingOtp){
            return{
                success: false,
                message: "OTP already sent. try again later"
            }
        }

        const otp = generateOtp()

        await client.setEx(`otp:${email}`,120,otp)

        await transporter.sendMail({
            form: process.env.EMAIL_USER,
            to: email,
            subject: "your OTP code",
            text : `your OTP is ${otp}`
        });

        return {success:true}
    } catch (err){
       console.log("send otp error", err);
       return{success: false, message: "Faild to send OTP"}
    }
}


const verifyOtp = async (email,userOtp) => {
    try {
        const storedOtp = await client.get(`OTP:${email}`)

        if(!storedOtp){
            return {success:false}
        }
        
        if(storedOtp === userOtp){
            await client.del(`otp:${email}`);
            return {success:false}
        }

    } catch (err) {
        console.log("verify OTP Error:" , err)
        return {success: false, message:"Somthing Went Wrong"}
        
    }
}

module.exports = {sendOtp,verifyOtp}