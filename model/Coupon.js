const { default: mongoose } = require("mongoose");

const CouponSchema = new mongoose.Schema({
  name: String,
  expire: Date,
  discount: Number,
});

module.exports = mongoose.model("Coupon", CouponSchema);
