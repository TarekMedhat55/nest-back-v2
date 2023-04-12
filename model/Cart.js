const { default: mongoose } = require("mongoose");

const CartSchema = new mongoose.Schema({
  cartItems: [
    {
      product: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: Number,
      price: Number,
      subTotal: Number,
    },
  ],
  totalCartPrice: Number,
  totalPriceAfterDiscount: Number,
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});
module.exports = mongoose.model("Cart", CartSchema);
