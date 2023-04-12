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

const router = require("express").Router();

router.post(
  "/create-category",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  createCategory
);
router.get("/", getAllCategories);
router.patch(
  "/:id",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  updatedCategory
);
router.delete(
  "/:id",
  Authentication,
  authorizedPermissions("admin", "vendor"),
  deleteCategory
);
module.exports = router;
