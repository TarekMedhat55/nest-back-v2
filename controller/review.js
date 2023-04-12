const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const Review = require("../model/Review");
const NotFoundError = require("../error/NotFoundError");

const createReview = async (req, res) => {
  const { title, ratings } = req.body;
  if (!title || !ratings) {
    throw new BadRequestError("all fields are required");
  }
  if (!req.body.product) req.body.product = req.params.productId;
  if (req.user.vendorId) {
    throw new BadRequestError("you cant't add a review,login as a user");
  }
  req.body.user = req.user.userId;
  //check if user added review before
  const checkProduct = await Review.findOne({
    user: req.user.userId,
    product: req.body.product,
  });
  if (checkProduct) {
    throw new BadRequestError("you can't add another review");
  }
  const reviewCreated = await Review.create(req.body);
  await reviewCreated.save();
  res.status(StatusCodes.CREATED).json({ msg: "review added successfully" });
};
const getAllProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).populate(
    { path: "user", select: "firstName lastName" }
  );
  if (reviews.length === 0) {
    throw new NotFoundError("there are no reviews for this product");
  }
  res.status(StatusCodes.OK).json({ reviews, length: reviews.length });
};
const updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new NotFoundError("this review is not exist");
  }
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action");
  }
  if (req.user.userId.toString() !== review.user._id.toString()) {
    throw new BadRequestError("you can't make this action");
  }
  const reviewUpdated = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  await reviewUpdated.save();

  res.status(StatusCodes.OK).json({ msg: "review updated successfully" });
};
const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new NotFoundError("this review not exist");
  }
  if (req.user.vendorId) {
    throw new BadRequestError("you can't make this action");
  }
  if (req.user.userId.toString() !== review.user._id.toString()) {
    throw new BadRequestError("you can't make this action");
  }
  const reiveDeleted = await Review.findByIdAndDelete(req.params.id);
  await reiveDeleted.remove();
  res.status(StatusCodes.OK).json({ msg: "review deleted successfully" });
};

module.exports = {
  createReview,
  getAllProductReviews,
  updateReview,
  deleteReview,
};
