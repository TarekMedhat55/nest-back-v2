const router = require("express").Router();

const { createCashOrder, getOrders } = require("../controller/order");
const { Authentication } = require("../middleware/Authentication");
router.post("/:cartId", Authentication, createCashOrder);
router.get("/", Authentication, getOrders);

module.exports = router;
