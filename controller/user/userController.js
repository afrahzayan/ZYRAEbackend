const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const user = require("../../model/userModel")
require("dotenv").config

const registrationController = async (req, res) => {
    try {
        const { fname, lname, email, password } = req.body

        const existingUser = await user.findOne({ email })

        if (existingUser) {
            return res.status(500).json({ message: "user already existing" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await user.create({
            fname,
            lname,
            email,
            password: hashedPassword
        })
        res.status(200).json({ message: "user created successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body

        const userCheck = await user.findOne({ email }).select("+password")

        if (!userCheck) {
            return res.status(404).json({ message: "User not found" })
        }

        const passwordCheck = await bcrypt.compare(password, userCheck.password)

        if (!passwordCheck) {
            return res.status(401).json({ message: "invalid password" })
        }

        const token = jwt.sign({ id: userCheck._id }, process.env.JWT_KEY)
        

        if (!token) {
            res.status(400).json({ message: "token not found" })
        }
        res.json({ token })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}






module.exports = { registrationController, loginController }