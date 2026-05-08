const express = require("express");
const router = express.Router();

const {
    addProduct
} = require("../../controller/admin/productController");

const upload = require("../../middleware/multer");

// ADD PRODUCT
router.post("/add", upload.single("image"), addProduct);

module.exports = router;