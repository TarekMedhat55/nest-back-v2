const {
  createProduct,
  getAllProducts,
  popularProducts,
  newProducts,
  bestSellProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getCategoryProducts,
} = require("../controller/product");
const {
  Authentication,
  authorizedPermissions,
} = require("../middleware/Authentication");
const { uploadSingleImage } = require("../middleware/uploadImage");

const router = require("express").Router();
const reviewRouter = require("./review");
router.post(
  "/create-product",
  Authentication,
  authorizedPermissions("vendor"),
  uploadSingleImage,
  createProduct
);
router.use("/:productId/reviews", reviewRouter);
router.get("/", getAllProducts);
router.get("/popular-products", popularProducts);
router.get("/new-products", newProducts);
router.get("/best-sell", bestSellProducts);
router.get("/:id", getProduct);
router.get("/:categoryId/products", getCategoryProducts);
router.patch(
  "/:id",
  Authentication,
  authorizedPermissions("vendor"),
  updateProduct
);
router.delete(
  "/:id",
  Authentication,
  authorizedPermissions("vendor"),
  deleteProduct
);

module.exports = router;
