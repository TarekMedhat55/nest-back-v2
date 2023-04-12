const BadRequestError = require("../error/BadRequestError");
const Product = require("../model/Product");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../error/NotFoundError");

const createProduct = async (req, res) => {
  const { name, price, sizes, quantity, category } = req.body;
  if (!name || !price || !sizes || !quantity || !category) {
    throw new BadRequestError("all fields are required");
  }
  req.body.vendor = req.user.vendorId;
  await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "product created successfully" });
};
//get popular products
const popularProducts = async (req, res) => {
  const products = await Product.find()
    .limit(10)
    .sort("-ratingsQuantity")
    .populate({ path: "category", select: "name" })
    .populate({ path: "vendor", select: "companyName" });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
//get new products
const newProducts = async (req, res) => {
  const sort = { createdAt: -1 };

  const products = await Product.find()
    .limit(10)
    .sort(sort)
    .populate({ path: "category", select: "name" })
    .populate({ path: "vendor", select: "companyName" });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};

const bestSellProducts = async (req, res) => {
  const products = await Product.find()
    .limit(10)
    .sort("-sold")
    .populate({ path: "category", select: "name" })
    .populate({ path: "vendor", select: "companyName" });
  if (products.length === 0) {
    throw new NotFoundError("there are no products");
  }
  res.status(StatusCodes.OK).json({ products });
};
//get all products
const getAllProducts = async (req, res) => {
  //filtering
  const queryStringObject = { ...req.query }; // we reset a req query as an object and take a copy from it
  const excludes = ["page", "limit", "sort", "keyword"]; //this things we will use it
  excludes.forEach((field) => delete queryStringObject[field]);
  let queryStr = JSON.stringify(queryStringObject);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  //paginate
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = Number(page - 1) * limit;
  //filter
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category",
      select: "name",
    })
    .populate({ path: "vendor", select: "companyName" });
  //sort
  if (req.query.sort) {
    mongooseQuery = mongooseQuery.sort(req.query.sort);
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }
  if (mongooseQuery.length === 0) {
    throw new NotFoundError("there are no products");
  }

  if (req.query.keyword) {
    let query = {};
    query.$or = [
      { name: { $regex: req.query.keyword, $options: "i" } },
      { description: { $regex: req.query.keyword, $options: "i" } },
    ];
    mongooseQuery = mongooseQuery.find(query);
  }
  const products = await mongooseQuery;
  const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

  const numOfPages = Math.ceil(totalProducts / limit);
  res.status(StatusCodes.OK).json({
    data: {
      products,
      numOfPages,
      page,
      totalProducts,
    },
  });
};
const getCategoryProducts = async (req, res) => {
  const { categoryId } = req.params;
  const products = await Product.find({ category: categoryId });
  if (products.length === 0) {
    throw new NotFoundError("there are no products for this category");
  }
  res.status(StatusCodes.OK).json({ products, length: products.length });
};
const getProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  if (!product) {
    throw new NotFoundError("this product is not exist");
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  console.log(product);
  if (req.user.vendorId.toString() !== product.vendor._id.toString()) {
    throw new BadRequestError("you can't make this action");
  }
  await Product.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "product updated successfully" });
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (req.user.vendorId.toString() !== product.vendor._id.toString()) {
    throw new BadRequestError("you can't make this action");
  }
  await Product.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "product deleted successfully" });
};
module.exports = {
  createProduct,
  popularProducts,
  newProducts,
  bestSellProducts,
  getAllProducts,
  updateProduct,
  getProduct,
  deleteProduct,
  getCategoryProducts,
};
