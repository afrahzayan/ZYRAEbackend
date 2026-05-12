const express = require("express");

const router = express.Router();

const {
    addProduct,
    getProducts,
    updateProduct,
    softDeleteProduct
} = require("../../controller/admin/productController");


router.get("/", getProducts);
router.post("/", addProduct)
router.put("/:id", updateProduct);
router.delete("/delete/:id", softDeleteProduct);

module.exports = router;