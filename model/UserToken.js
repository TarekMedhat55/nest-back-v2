const { default: mongoose } = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  refreshToken: String,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("UserToken", UserTokenSchema);
