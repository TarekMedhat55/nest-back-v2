const router = require("express").Router({ mergeParams: true });
const {
  createReview,
  getAllProductReviews,
  updateReview,
  deleteReview,
} = require("../controller/review");
const { Authentication } = require("../middleware/Authentication");
router.post("/create-review", Authentication, createReview);
router.get("/", getAllProductReviews);
router.patch("/:id", Authentication, updateReview);
router.delete("/:id", Authentication, deleteReview);

module.exports = router;
