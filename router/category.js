const {
  createCategory,
  getAllCategories,
  updatedCategory,
  deleteCategory,
} = require("../controller/category");

const {
  Authentication,
  authorizedPermissions,
} = require("../middleware/Authentication");
const { uploadSingleImage } = require("../middleware/uploadImage");

const router = require("express").Router();

router.post(
  "/create-category",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  uploadSingleImage,
  createCategory
);
router.get("/", getAllCategories);
router.patch(
  "/:id",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  uploadSingleImage,
  updatedCategory
);
router.delete(
  "/:id",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  deleteCategory
);
module.exports = router;
