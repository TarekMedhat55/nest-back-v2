const { default: mongoose } = require("mongoose");

const VendorTokenSchema = new mongoose.Schema({
  refreshToken: String,
  vendor: {
    type: mongoose.Types.ObjectId,
    ref: "Vendor",
  },
});

module.exports = mongoose.model("VendorToken", VendorTokenSchema);
