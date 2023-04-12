const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const NotFoundError = require("../error/NotFoundError");
const Product = require("../model/Product");
const Cart = require("../model/Cart");
const Coupon = require("../model/Coupon");

const calcCartTotalPrice = (userCart) => {
  let totalPrice = 0;
  userCart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  userCart.totalCartPrice = totalPrice;
  userCart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};
const addProductToCart = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const { productId, size, quantity } = req.body;
  if (!productId || !size) {
    throw new BadRequestError("product and size required");
  }
  //get product
  const product = await Product.findById(productId);
  //get user cart
  let userCart = await Cart.findOne({ user: req.user.userId });
  //check if user have a cart or not
  if (!userCart) {
    //if user don't have a cart create one
    userCart = await Cart.create({
      cartItems: [
        {
          product: productId,
          size,
          price: product.price,
          subTotal: product.price,
        },
      ],
      user: req.user.userId,
    });
  } else {
    //user have a cart
    //check if this product exist in cart
    const productIndex = userCart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.size === size
    );
    //if exist updated quantity and subTotalPrice
    if (productIndex > -1) {
      const cartItem = userCart.cartItems[productIndex];
      cartItem.quantity = quantity;
      cartItem.subTotal = product.price * quantity;
      userCart.cartItems[productIndex] = cartItem;
    } else {
      //product not exist push it
      userCart.cartItems.push({
        product: productId,
        size,
        price: product.price,
        subTotal: product.price,
      });
    }
  }
  //calc cart price
  calcCartTotalPrice(userCart);
  await userCart.save();

  res.status(StatusCodes.OK).json({
    msg: "product added to cart successfully",
    userCart,
    length: userCart.cartItems.length,
  });
};
//get user cart
const getUserCart = async (req, res) => {
  const userCart = await Cart.findOne({ user: req.user.userId }).populate({
    path: "cartItems.product",
    select: "name imageCover price sizes priceAfterDiscount",
  });
  if (!userCart) {
    throw new NotFoundError("cart it's empty");
  }
  res.status(StatusCodes.OK).json({
    userCart,
    length: userCart.cartItems.length,
  });
};
//remove product
const deleteProductFromCart = async (req, res) => {
  const userCart = await Cart.findOneAndUpdate(
    { user: req.user.userId },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );
  calcCartTotalPrice(userCart);
  res.status(StatusCodes.OK).json({
    msg: "product removed from cart successfully",
    userCart,
    length: userCart.cartItems.length,
  });
};
//clear cart
const clearCart = async (req, res) => {
  const userCart = await Cart.findOne({ user: req.user.userId });
  if (!userCart) {
    throw new NotFoundError("cart it's empty");
  }
  await userCart.remove();
  calcCartTotalPrice(userCart);
  res.status(StatusCodes.OK).json({ msg: "all products deleted successfully" });
};
//update quantity
const updateQuantity = async (req, res) => {
  const { quantity } = req.body;
  const userCart = await Cart.findOne({ user: req.user.userId });
  //check if this product exist
  const productIndex = userCart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  //if product exist
  if (productIndex > -1) {
    const cartItem = userCart.cartItems[productIndex];
    cartItem.quantity = quantity;
    cartItem.subTotal = cartItem.price * quantity;
    userCart.cartItems[productIndex] = cartItem;
  } else {
    throw new NotFoundError("this product not exist");
  }
  calcCartTotalPrice(userCart);
  await userCart.save();

  res.status(StatusCodes.OK).json({
    msg: "product removed from cart successfully",
    userCart,
    length: userCart.cartItems.length,
  });
};
//apply coupon
const applyCoupon = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("coupon name is required");
  }
  const coupon = await Coupon.findOne({ name });
  if (!coupon) {
    throw new NotFoundError("this coupon not exist");
  }
  //check if coupon expired
  if (coupon.expire < Date.now()) {
    throw new BadRequestError("coupon is expired");
  }
  const userCart = await Cart.findOne({ user: req.user.userId });
  const totalPrice = userCart.totalCartPrice;
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);
  //cart total price equal to totalPriceAfterDisCount
  userCart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await userCart.save();
  res
    .status(StatusCodes.OK)
    .json({ numOfCartItems: userCart.cartItems.length, data: userCart });
};
module.exports = {
  addProductToCart,
  getUserCart,
  deleteProductFromCart,
  clearCart,
  updateQuantity,
  applyCoupon,
};
