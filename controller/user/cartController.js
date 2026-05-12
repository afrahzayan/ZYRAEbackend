const mongoose = require("mongoose");
const Cart = require("../../model/cartModel");



// GET CART
const getCartItems = async (req, res) => {

  try {

    const userId =
      req.user.id ||
      req.user.userID ||
      req.user._id;

    const cart = await Cart.findOne({
      user: userId
    }).populate("items.product");

    if (!cart) {
      return res.status(200).json([]);
    }

    res.status(200).json(cart.items);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to fetch cart"
    });
  }
};




// ADD TO CART
const addToCart = async (req, res) => {

  try {

    const userId =
      req.user.id ||
      req.user.userID ||
      req.user._id;

    console.log("USER ID:", userId);

    const {
      productId: rawProductId,
      _id,
      id,
      quantity = 1,
      price,
      discount = 0
    } = req.body;

    const productId = rawProductId || _id || id;
    console.log("BODY:", req.body);

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    if (price === undefined || price === null) {
      return res.status(400).json({ message: "price is required" });
    }

    let cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {

      cart = await Cart.create({
        user: userId,
        items: []
      });
    }

    const existingProduct = cart.items.find(
      item => item.product && item.product.toString() === productId.toString()
    );

    if (existingProduct) {

      existingProduct.quantity += quantity;

    } else {

      cart.items.push({
        product: productId,
        quantity,
        price,
        discount
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({
      user: userId
    }).populate("items.product");

    res.status(200).json(updatedCart.items);

  } catch (error) {

    console.log("ADD TO CART ERROR:", error);

    res.status(500).json({
      message: "Failed to add to cart"
    });
  }
};




// UPDATE QUANTITY
const updateCartItem = async (req, res) => {

  try {

    const userId =
      req.user.id ||
      req.user.userID ||
      req.user._id;

    const itemId = req.params.id;

    const { quantity } = req.body;

    const cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json(cart.items);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to update cart"
    });
  }
};




// REMOVE ITEM
const deleteCartItem = async (req, res) => {

  try {

    const userId =
      req.user.id ||
      req.user.userID ||
      req.user._id;

    const itemId = req.params.id;

    const cart = await Cart.findOne({
      user: userId
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId
    );

    await cart.save();

    res.status(200).json(cart.items);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to remove item"
    });
  }
};




// CLEAR CART
const clearCart = async (req, res) => {

  try {

    const userId =  req.user.id || req.user.userID || req.user._id;;

    await Cart.findOneAndUpdate(
      { user: userId },
      { items: [] }
    );

    res.status(200).json({
      message: "Cart cleared"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to clear cart"
    });
  }
};




module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
};