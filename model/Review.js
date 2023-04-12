const { default: mongoose } = require("mongoose");
const Product = require("./Product");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "min ratings value is 1.0"],
      max: [5, "max ratings value is 5.0"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);
//review aggregation
ReviewSchema.statics.calcAverageRatings = async function (productId) {
  const result = await this.aggregate([
    //stage 1
    //get all reviews in specific productId
    { $match: { product: productId } },
    //create groupe based productId and calc average for ratings and sum
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  //there is a reviews
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantity: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    });
  }
};
ReviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});
ReviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatings(this.product);
});
ReviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "firstName lastName" });
  next();
});
module.exports = mongoose.model("Review", ReviewSchema);
