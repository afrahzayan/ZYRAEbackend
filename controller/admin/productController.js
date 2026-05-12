const productModel = require("../../model/productModel");


// ================= ADD PRODUCT =================
const addProduct = async (req, res) => {

    try {

        const {
            name,
            price,
            category,
            description,
            collection,
            stock
        } = req.body;

        const image = req.file ? req.file.path : "";

        if (!name || !price || !image) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        const newProduct = new productModel({
            name,
            price,
            image,
            category,
            description,
            collection,
            stock
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: newProduct
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error adding product",
            error: err.message
        });

    }
};


// ================= GET PRODUCTS =================
const getProducts = async (req, res) => {

    try {

        const products = await productModel.find()

        res.status(200).json(products);

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error fetching products"
        });

    }
};


// ================= UPDATE PRODUCT =================
const updateProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedProduct) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error updating product"
        });

    }
};


// ================= SOFT DELETE PRODUCT =================
const softDeleteProduct = async (req, res) => {

    try {

        const { id } = req.params;

        const existingProduct = await productModel.findById(id);

        if (!existingProduct) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        await productModel.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error deleting product"
        });

    }
};


module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    softDeleteProduct
};