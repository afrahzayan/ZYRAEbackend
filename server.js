const express = require("express")
const user = require("./routes/user/userRoutes")
const connectDB = require("./config/db");
require("dotenv").config()
const app = express()
app.use(express.json())

connectDB()

app.use("/api/auth",user)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
});