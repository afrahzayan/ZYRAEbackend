const productModel = require("../../model/productModel");



// GET ALL PRODUCTS WITH PAGINATION
const getProducts = async (req, res) => {
    try {

        const {
            collection,
            page = 1,
            limit = 8
        } = req.query;

        let query = {}

        
        if (collection) {
            query.collection = {
                $regex: new RegExp(`^${collection}$`, 'i')
            };
        }

        
        const skip = (Number(page) - 1) * Number(limit);

        
        const totalProducts = await productModel.countDocuments(query);

        
        const products = await productModel.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        // FORMAT PRODUCTS
        const formattedProducts = products.map(product => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            collection: product.collection,
            stock: product.stock
        }));

        // TOTAL PAGES
        const totalPages = Math.ceil(totalProducts / Number(limit));

        res.status(200).json({
            success: true,
            products: formattedProducts,
            currentPage: Number(page),
            totalPages,
            totalProducts
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
            $or: [
                { isDeleted: false },
                { isDeleted: { $exists: false } }
            ]
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



module.exports = {
    getProducts,
    getSingleProduct,
    
};