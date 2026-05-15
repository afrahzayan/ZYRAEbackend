const express = require('express')
const router = express.Router()

const {getAllOrders, updateOrderStatus} = require("../../controller/admin/orderController")


router.get("/", getAllOrders);
router.put("/:id",updateOrderStatus)


module.exports = router;