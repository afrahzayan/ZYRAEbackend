const Cart = require("../../model/cartModel");

// GET CART ITEMS
const getCartItems = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Get userId from multiple possible locations
        const userId = req.user.id || req.user.userID || req.user._id;
        
        console.log("Fetching cart for userId:", userId);
        
        const cartItems = await Cart.find({ userId });
        res.status(200).json(cartItems);

    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({
            message: "Failed to fetch cart items",
            error: error.message,
        });
    }
};

// ADD TO CART
const addToCart = async (req, res) => {
    try {
        console.log("=== ADD TO CART DEBUG ===");
        console.log("req.user exists:", !!req.user);
        console.log("req.user content:", JSON.stringify(req.user, null, 2));
        console.log("req.body:", JSON.stringify(req.body, null, 2));

        if (!req.user) {
            console.log("ERROR: No req.user found!");
            return res.status(401).json({
                message: "Unauthorized user",
            });
        }

        // Try multiple ways to get userId
        const userId = req.user.id || req.user.userID || req.user._id;
        console.log("Extracted userId:", userId);
        
        if (!userId) {
            console.log("ERROR: No userId found in req.user!");
            console.log("req.user keys:", Object.keys(req.user));
            return res.status(400).json({
                message: "User ID not found in request",
                userObject: req.user
            });
        }

        const {
            productId,
            name,
            price,
            image,
            quantity = 1,
            size = "50ml",
        } = req.body;

        console.log("Creating cart with userId:", userId);
        console.log("ProductId:", productId);

        // validation
        if (!productId) {
            return res.status(400).json({
                message: "Missing productId",
            });
        }

        // CHECK EXISTING ITEM
        const existingItem = await Cart.findOne({
            userId,
            productId,
            size,
        });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
            return res.status(200).json(existingItem);
        }

        // CREATE NEW ITEM
        const cartItem = await Cart.create({
            userId,  // This MUST be present
            productId,
            name,
            price,
            image,
            quantity,
            size,
        });

        console.log("Cart item created successfully:", cartItem._id);
        res.status(201).json(cartItem);

    } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        console.error("Error details:", error.message);
        res.status(500).json({
            message: "Failed to add item",
            error: error.message,
        });
    }
};

// UPDATE CART ITEM
const updateCartItem = async (req, res) => {
    try {
        const updatedItem = await Cart.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        res.status(200).json(updatedItem);

    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            message: "Failed to update cart item",
            error: error.message,
        });
    }
};

// DELETE CART ITEM
const deleteCartItem = async (req, res) => {
    try {
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: "Cart item not found",
            });
        }

        res.status(200).json({
            message: "Item removed from cart",
        });

    } catch (error) {
        console.error("Error deleting cart item:", error);
        res.status(500).json({
            message: "Failed to remove item",
            error: error.message,
        });
    }
};

module.exports = {
    getCartItems,
    addToCart,
    updateCartItem,
    deleteCartItem,
};