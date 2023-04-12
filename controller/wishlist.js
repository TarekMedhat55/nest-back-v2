const { StatusCodes } = require("http-status-codes");
const User = require("../model/User");
const BadRequestError = require("../error/BadRequestError");

const addProductToWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    throw new BadRequestError("product is required");
  }
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      $addToSet: { wishList: productId },
    },
    { new: true }
  );
  res
    .status(StatusCodes.CREATED)
    .json({ wishlist: user.wishList, length: user.wishList.length });
};
const getUserWishlist = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findById(req.user.userId).populate("wishList");
  res
    .status(StatusCodes.OK)
    .json({ wishlist: user.wishList, length: user.wishList.length });
};
const deleteProductFromWishlist = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { wishList: req.params.productId } },
    { new: true }
  );
  res.status(StatusCodes.OK).json({
    msg: "product removed successfully",
    wishlist: user.wishList,
    length: user.wishList.length,
  });
};

module.exports = {
  addProductToWishlist,
  getUserWishlist,
  deleteProductFromWishlist,
};
