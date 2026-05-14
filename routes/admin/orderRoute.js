const express = require('express')
const router = express.Router()

const {fetchAllOrders,
    specificUserOrderList,
    updateOrderStatus} = require("../../controller/admin/orderController")


router.get("/", fetchAllOrders);
router.get("/user/:id",specificUserOrderList)
router.put("/status/:id",updateOrderStatus)

module.exports = router;