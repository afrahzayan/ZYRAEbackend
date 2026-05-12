const express = require("express");
const router = express.Router();
const {
  getCartItems,
  addToCart,
  updateCartItem,
  deleteCartItem,
  clearCart
} = require("../../controller/user/cartController");
const protectRoutes = require("../../middleware/protectRout");

// ALL routes should be protected
router.get("/", protectRoutes, getCartItems);
router.post("/", protectRoutes, addToCart);  // Make sure protectRoutes is here
router.delete("/clear/all",protectRoutes,clearCart);
router.put("/:id", protectRoutes, updateCartItem);
router.delete("/:id", protectRoutes, deleteCartItem);

module.exports = router;