const express = require("express");
const router = express.Router();

const protectRoute = require("../../middleware/protectRout");
const createCheckoutSession = require("../../controller/user/checkoutSession");
const getUserOrders = require("../../controller/user/getUserOrder");
const createCodOrder = require("../../controller/user/codeOrderController");
// CREATE CHECKOUT SESSION
router.post(
  "/create-checkout-session", protectRoute,createCheckoutSession);
// GET USER ORDERS
router.get("/",protectRoute, getUserOrders);

router.post("/create-code-order",protectRoute,createCodOrder)

module.exports = router;