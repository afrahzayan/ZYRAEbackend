const productModel = require("../../model/productModel");

// GET ALL PRODUCTS (with optional collection filter)
const getProducts = async (req, res) => {
    try {
        const { collection } = req.query; // Get collection from query params

        let query = {};

        // If collection parameter is provided, filter by it
        if (collection) {
            query.collection = { $regex: new RegExp(`^${collection}$`, 'i') }; // Case-insensitive match
        }

        const products = await productModel.find({
            ...query,
            isDeleted: false
        }).lean();
        const formattedProducts = products.map(product => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            collection: product.collection,
            stock: product.stock
        }));

        res.status(200).json({
            success: true,
            count: formattedProducts.length,
            products: formattedProducts
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching products",
            error: err.message
        });
    }
};

// GET SINGLE PRODUCT
const getSingleProduct = async (req, res) => {
    try {
        const product = await productModel.findOne({
            _id: req.params.id,
            isDeleted: false
        }).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const formattedProduct = {
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            collection: product.collection,
            stock: product.stock
        };

        res.status(200).json({
            success: true,
            product: formattedProduct
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching product",
            error: err.message
        });
    }
};

const softDeleteProduct = async (req, res) => {
    try {

        const product = await productModel.findByIdAndUpdate(
            req.params.id,
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Product soft deleted successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error deleting product",
            error: err.message
        });

    }
};

module.exports = {
    getProducts,
    getSingleProduct,
    softDeleteProduct
};