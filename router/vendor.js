const {
  vendorRegister,
  vendorLogin,
  vendorLogout,
  vendorForgetPassword,
  vendorResetCode,
  vendorChangePassword,
} = require("../controller/vendorAuth");
const { Authentication } = require("../middleware/Authentication");

const router = require("express").Router();

router.post("/vendor-register", vendorRegister);
router.post("/vendor-login", vendorLogin);
router.delete("/vendor-logout", Authentication, vendorLogout);
router.post("/vendor-forget-password", vendorForgetPassword);
router.post("/reset-code", vendorResetCode);
router.post("/change-password", vendorChangePassword);
module.exports = router;
