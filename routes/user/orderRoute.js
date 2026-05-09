const express = require("express");
const router = express.Router();

const protectRoute = require("../../middleware/protectRout");
const createCheckoutSession = require("../../controller/user/checkoutSession");
const getUserOrders = require("../../controller/user/getUserOrder");
const createCodeOrder = require("../../controller/user/codeOrderController")

// CREATE CHECKOUT SESSION
router.post(
  "/create-checkout-session", protectRoute,createCheckoutSession);
// GET USER ORDERS
router.get("/",protectRoute, getUserOrders);

router.post("create-code-order",protectRoute,createCodeOrder)

module.exports = router;