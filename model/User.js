const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      default: "user",
    },
    refreshToken: String,
    passwordResetCode: String,
    passwordResetCodeValid: Boolean,
    passwordResetCodeExpire: Date,
    wishList: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    compare: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    address: [
      {
        id: mongoose.Types.ObjectId,
        alias: String,
        details: String,
        phone: String,
        city: String,
        postcode: String,
        street: String,
        firstName: String,
        lastName: String,
        email: String,
      },
    ],
  },
  { timestamps: true }
);
UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.comparePassword = async function (passwordCheck) {
  const isMatch = await bcrypt.compare(passwordCheck, this.password);
  return isMatch;
};
module.exports = mongoose.model("User", UserSchema);
