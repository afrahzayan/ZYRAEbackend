
const express = require("express");

const router = express.Router();

const {
    getProducts,
    getSingleProduct,
    
} = require("../../controller/user/productController");



router.get("/", getProducts);
router.get("/:id", getSingleProduct);


module.exports = router;