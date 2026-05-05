const express = require("express")
const route = express.Router()

const {registrationController, loginController} = require("../../controller/user/userController")

route.post("/register",registrationController);
route.post("/login",loginController)

module.exports = route