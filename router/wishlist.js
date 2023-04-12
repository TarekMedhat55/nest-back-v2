const router = require("express").Router();
const {
  addProductToWishlist,
  getUserWishlist,
  deleteProductFromWishlist,
} = require("../controller/wishlist");
const { Authentication } = require("../middleware/Authentication");

router.post("/add-product", Authentication, addProductToWishlist);
router.get("/", Authentication, getUserWishlist);
router.delete("/:productId", Authentication, deleteProductFromWishlist);

module.exports = router;
