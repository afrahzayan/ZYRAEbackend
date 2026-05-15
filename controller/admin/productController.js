const productModel = require("../../model/productModel");



const addProduct = async (req, res) => {

    try {

       const {
    name,
    price,
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





const getProducts = async (req, res) => {

    try {

        const {
            search = "",
            collection = "all",
            sortBy = "",
            page = 1,
            limit = 5
        } = req.query;

        let filter = {}

        // SEARCH
        if (search) {
            filter.$or = [
                {
                    name: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    collection: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // COLLECTION FILTER
        if (collection !== "all") {
            filter.collection = collection;
        }

        // SORTING
        let query = productModel.find(filter);

     if (sortBy === "name") {
            query = query.sort({ name: 1 });
        }

        if (sortBy === "price") {
            query = query.sort({ price: 1 });
        }

        if (sortBy === "collection") {
            query = query.sort({ collection: 1 });
        }


        const skip = (Number(page) -1) * Number(limit);
         query = query.skip(skip).limit(Number(limit));

          const products = await query;

         const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

          const collections = await productModel.distinct("collection");

        res.status(200).json({
            success: true,
            products,
            collections,
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


const getCollections = async (req, res) => {

    try {

        const collections = await productModel.distinct("collection");

        res.status(200).json({
            success: true,
            collections
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: "Error fetching collections"
        });

    }
};


module.exports = {
    addProduct,
    getProducts,
    updateProduct,
    softDeleteProduct,
    getCollections
};