const express = require("express");
const upload = require("../../middleware/multer");
const router = express.Router();

const {
    addProduct,
    getProducts,
    updateProduct,
    softDeleteProduct
} = require("../../controller/admin/productController");


router.get("/", getProducts);
router.post("/", upload.single("image"), addProduct)
router.put("/:id", updateProduct);
router.delete("/delete/:id", softDeleteProduct);

module.exports = router;