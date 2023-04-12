const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const Coupon = require("../model/Coupon");
const NotFoundError = require("../error/NotFoundError");

const createCoupon = async (req, res) => {
  const { name, expire, discount } = req.body;
  if (!name || !expire || !discount) {
    throw new BadRequestError("all fields are required");
  }
  await Coupon.create({ name, expire, discount });
  res.status(StatusCodes.CREATED).json({ msg: "coupon created successfully" });
};

const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find();
  if (coupons.length === 0) {
    throw new NotFoundError("there are no coupons");
  }
  res.status(StatusCodes.OK).json({ coupons });
};

const updateCoupon = async (req, res) => {
  await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "coupon updated successfully" });
};
const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.status(StatusCodes.OK).json({ msg: "coupon deleted successfully" });
};

module.exports = { createCoupon, deleteCoupon, updateCoupon, getAllCoupons };
