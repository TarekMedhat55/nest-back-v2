const router = require("express").Router();
const {
  addProductToCart,
  getUserCart,
  deleteProductFromCart,
  clearCart,
  updateQuantity,
  applyCoupon,
} = require("../controller/cart");
const { Authentication } = require("../middleware/Authentication");
router.post("/add-product", Authentication, addProductToCart);
router.post("/apply-coupon", Authentication, applyCoupon);
router.get("/", Authentication, getUserCart);
router.delete("/clear-cart", Authentication, clearCart);
router.patch("/:itemId", Authentication, updateQuantity);
router.delete("/:itemId", Authentication, deleteProductFromCart);

module.exports = router;
