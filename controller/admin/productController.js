const productModel = require("../../model/productModel");

// ADD PRODUCT
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

        // CLOUDINARY IMAGE URL
        const image = req.file ? req.file.path : "";

        // VALIDATION
        if (!name || !price || !image) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });

        }

        // CREATE PRODUCT
        const newProduct = new productModel({
            name,
            price,
            image,
            description,
            collection,
            stock
        });

        await newProduct.save();

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product: {
                id: newProduct._id,
                name: newProduct.name,
                price: newProduct.price,
                image: newProduct.image,
                description: newProduct.description,
                collection: newProduct.collection,
                stock: newProduct.stock
            }
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error adding product",
            error: err.message
        });

    }
};

module.exports = {
    addProduct
};