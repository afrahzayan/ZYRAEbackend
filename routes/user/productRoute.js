
const express = require("express");

const router = express.Router();

const {
    getProducts,
    getSingleProduct,
    softDeleteProduct
} = require("../../controller/user/productController");



router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/product/delete/:id",softDeleteProduct)

module.exports = router;