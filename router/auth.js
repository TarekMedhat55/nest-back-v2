const {
  userRegister,
  userLogin,
  logoutUser,
  userForgetPassword,
  userResetCode,
  userChangePassword,
} = require("../controller/auth");
const { Authentication } = require("../middleware/Authentication");

const router = require("express").Router();

router.post("/user-register", userRegister);
router.post("/user-login", userLogin);
router.delete("/user-logout", Authentication, logoutUser);
router.post("/user-forget-password", userForgetPassword);
router.post("/reset-code", userResetCode);
router.post("/change-password", userChangePassword);
module.exports = router;
