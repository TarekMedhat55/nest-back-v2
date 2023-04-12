const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const VendorSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "company name is required"],
    },
    firstName: {
      type: String,
      required: [true, "first name is required"],
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "phone number is required"],
    },
    passwordResetCode: String,
    passwordResetCodeValid: Boolean,
    passwordResetCodeExpired: Date,
    role: {
      type: String,
      enum: ["vendor", "admin"],
      default: "vendor",
    },
  },
  { timestamps: true }
);

VendorSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
VendorSchema.methods.comparePassword = async function (passwordCheck) {
  const isMatch = await bcrypt.compare(passwordCheck, this.password);
  return isMatch;
};
module.exports = mongoose.model("Vendor", VendorSchema);
