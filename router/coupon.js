const {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
} = require("../controller/coupon");
const {
  Authentication,
  authorizedPermissions,
} = require("../middleware/Authentication");

const router = require("express").Router();

router.post(
  "/create-coupon",
  Authentication,
  authorizedPermissions("admin"),
  createCoupon
);
router.get("/", getAllCoupons);
router.patch(
  "/:id",
  Authentication,
  authorizedPermissions("admin"),
  updateCoupon
);
router.delete(
  "/:id",
  Authentication,
  authorizedPermissions("admin"),
  deleteCoupon
);
module.exports = router;
