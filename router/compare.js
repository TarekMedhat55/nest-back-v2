const router = require("express").Router();

const {
  addProductToCompare,
  getUserCompares,
  removeProductFromCompare,
} = require("../controller/compare");
const { Authentication } = require("../middleware/Authentication");

router.post("/add-product", Authentication, addProductToCompare);
router.get("/", Authentication, getUserCompares);
router.delete("/:productId", Authentication, removeProductFromCompare);

module.exports = router;
