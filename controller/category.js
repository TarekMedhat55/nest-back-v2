const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const Category = require("../model/Category");
const NotFoundError = require("../error/NotFoundError");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

//upload image
//we will use memory storage to save it in buffer
const multerStorage = multer.memoryStorage();
//filter images to upload images only
const multerFilter = function (req, file, callBack) {
  //file=>mimetype:image/jpeg
  if (file.mimetype.startsWith("image")) {
    //no error
    callBack(null, true);
  } else {
    callBack(new BadRequestError("only images allowed"), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
const uploadCategoryImage = upload.single("image");
//sharp image
const resizeImage = async (req, res, next) => {
  const imagesName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  //console.log(sharp);
  await sharp(req.file.buffer)
    .resize({
      width: 400,
      height: 400,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("jpeg")
    .toFile(`uploads/categories/${imagesName}`); //to file to save it
  //save image name in database
  req.body.image = imagesName;
  next();
};
const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new BadRequestError("category name is required");
  }
  //check category is exist
  const category = await Category.findOne({ name });
  if (category) {
    throw new BadRequestError("category is exist");
  }
  await Category.create(req.body);
  res
    .status(StatusCodes.CREATED)
    .json({ msg: "category created successfully" });
};
const getAllCategories = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;
  const categories = await Category.find().skip(skip).limit(limit);
  if (categories.length === 0) {
    throw new NotFoundError("there are no categories");
  }
  res.status(StatusCodes.OK).json({ categories, length: categories.length });
};
const updatedCategory = async (req, res) => {
  const { id } = req.params;
  //check category
  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!category) {
    throw new NotFoundError("this category not exist");
  }
  res.status(StatusCodes.OK).json({ msg: "category updated successfully" });
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new NotFoundError("this category not exist");
  }
  res.status(StatusCodes.OK).json({ msg: "category deleted successfully" });
};

module.exports = {
  createCategory,
  getAllCategories,
  updatedCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
};
