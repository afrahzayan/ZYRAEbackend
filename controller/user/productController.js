// controllers/productController.js

const productModel = require("../../model/productModel");


// GET ALL PRODUCTS
const getProducts = async (req, res) => {

    const { category, search } = req.query;

    try {

        const filter = {};

        // SEARCH PRODUCT
        if (search && search.trim() !== "") {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // FILTER BY CATEGORY
        if (category && category.trim() !== "") {
            filter.category = {
                $regex: `^${category}$`,
                $options: "i"
            };
        }

        const productsData = await productModel.find(filter).lean();

        // FORMAT PRODUCT DATA
        const formattedProducts = productsData.map(product => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description,
            collection: product.collection,
            stock: product.stock
        }));

        res.status(200).json(formattedProducts);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching products",
            error: err.message
        });

    }
};



const getSingleProduct = async (req, res) => {

    try {

        const product = await productModel
            .findById(req.params.id)
            .lean();

        
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

    
        const formattedProduct = {
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description,
            collection: product.collection,
            stock: product.stock
        };

        res.status(200).json(formattedProduct);

    } catch (err) {

        res.status(500).json({
            message: "Error fetching product",
            error: err.message
        });

    }
};


module.exports = {
    getProducts,
    getSingleProduct
};