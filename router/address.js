const router = require("express").Router();

const {
  addAddress,
  getUserAddress,
  removeUserAddress,
} = require("../controller/address");
const { Authentication } = require("../middleware/Authentication");

router.post("/add-product", Authentication, addAddress);
router.get("/", Authentication, getUserAddress);
router.delete("/:productId", Authentication, removeUserAddress);

module.exports = router;
