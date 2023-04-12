const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const User = require("../model/User");

const addProductToCompare = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new BadRequestError("product is required");
  }
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $addToSet: { compare: productId } },
    { new: true }
  );
  res.status(StatusCodes.CREATED).json({
    msg: "product added successfully",
    product: user.compare,
    length: user.compare.length,
  });
};

const getUserCompares = async (req, res) => {
  const user = await User.findById(req.user.userId).populate("compare");
  res
    .status(StatusCodes.OK)
    .json({ compare: user.compare, length: user.compare.length });
};

const removeProductFromCompare = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { compare: req.params.productId } },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .json({ compare: user.compare, length: user.compare.length });
};

module.exports = {
  addProductToCompare,
  getUserCompares,
  removeProductFromCompare,
};
