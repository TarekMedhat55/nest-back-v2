const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const User = require("../model/User");

const addAddress = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  await User.findByIdAndUpdate(
    req.user.userId,
    { $addToSet: { address: req.body } },
    { new: true }
  );
  res.status(StatusCodes.OK).json({ msg: "address added successfully" });
};
const getUserAddress = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findById(req.user.userId).populate("address");
  res.status(StatusCodes.OK).json({ address: user.address });
};
const removeUserAddress = async (req, res) => {
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action,login as a user");
  }
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $pull: { address: { _id: req.params.addressId } } },
    { new: true }
  );
  res
    .status(StatusCodes.OK)
    .json({ msg: "address removed successfully", address: user.address });
};
module.exports = { getUserAddress, addAddress, removeUserAddress };
