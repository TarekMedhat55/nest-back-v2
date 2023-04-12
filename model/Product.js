const { default: mongoose } = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "product name is required"],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "product price is required"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: [true, "product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    sizes: [Number],
    imageCover: {
      type: String,
    },
    images: [String],
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating muse be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    type: String,
    mfg: Date,
    life: String,
    sku: String,
  },
  {
    timestamps: true,
    //to enable virtual reviews
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});
ProductSchema.pre(/^find/, async function (next) {
  this.populate({ path: "vendor", select: "companyName" });
  next();
});
module.exports = mongoose.model("Product", ProductSchema);
