const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../error/NotFoundError");
const Cart = require("../model/Cart");
const Order = require("../model/Order");
const Product = require("../model/Product");

const createCashOrder = async (req, res) => {
  const taxPrice = 20;
  const shippingPrice = 30;
  //get card depend on cart id
  const userCart = await Cart.findById(req.params.cartId);
  if (!userCart) {
    throw new NotFoundError("this cart not exist");
  }
  //get cart price
  const cartPrice = userCart.totalPriceAfterDiscount
    ? userCart.totalPriceAfterDiscount
    : userCart.totalCartPrice;
  //order price
  const orderPrice = cartPrice + taxPrice + shippingPrice;
  //create order
  const order = await Order.create({
    user: req.user.userId,
    cartItems: userCart.cartItems,
    totalOrderPrice: orderPrice,
    shippingAddress: req.body.shippingAddress,
  });
  //update product sold and quantity
  if (order) {
    const bulkOption = userCart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: "your order have been received", order });
};
const getOrders = async (req, res) => {
  //paginate
  const page = req.query.page || 1;
  const limit = req.query.limit || 5;
  const skip = (page - 1) * limit;
  const orders = await Order.find({ user: req.user.userId })
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);
  if (orders.length === 0) {
    throw new NotFoundError("there are no orders");
  }
  const orderLength = await Order.countDocuments({ user: req.user.userId });
  const numPages = Math.ceil(orderLength / limit);
  res.status(StatusCodes.OK).json({ orders, numPages, orderLength });
};

module.exports = { createCashOrder, getOrders };
