const { StatusCodes } = require("http-status-codes");
const BadRequestError = require("../error/BadRequestError");
const Category = require("../model/Category");
const NotFoundError = require("../error/NotFoundError");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../middleware/cloudinary");
const fs = require("fs");

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

  const imagesName = `category-${uuidv4()}-${Date.now()}.jpeg`;
  if (!req.file) {
    throw new BadRequestError("no file provided");
  }
  //console.log(sharp);
  await sharp(req.file.buffer)
    .resize({
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .toFormat("jpeg")
    .toFile(`uploads/categories/${imagesName}`); //to file to save it
  const imagePath = path.join(__dirname, `../uploads/categories/${imagesName}`);
  //upload image to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  await Category.create({
    name,
    image: { url: result.url, publicId: result.public_id },
  });
  res.status(StatusCodes.CREATED).json({
    msg: "category created successfully",
    photo: { url: result.url, publicId: result.public_id },
  });
  //delete image from server after upload it
  fs.unlinkSync(imagePath);
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
  const { name } = req.body;
  if (req.file) {
    const category = await Category.findById(id);
    //delete old image
    await cloudinaryRemoveImage(category.image.publicId);
    //
    const imagesName = `category-${uuidv4()}-${Date.now()}.jpeg`;
    //console.log(sharp);
    await sharp(req.file.buffer)
      .resize({
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFormat("jpeg")
      .toFile(`uploads/categories/${imagesName}`); //to file to save it
    const imagePath = path.join(
      __dirname,
      `../uploads/categories/${imagesName}`
    );
    //upload image to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    await Category.findByIdAndUpdate(
      id,
      { name, image: { url: result.url, publicId: result.public_id } },
      { new: true }
    );
    res.status(StatusCodes.OK).json({ msg: "category updated successfully" });
    //delete image from server after upload it
    fs.unlinkSync(imagePath);
    return;
  }
  await Category.findByIdAndUpdate(id, req.body, { new: true });
  res.status(StatusCodes.OK).json({ msg: "category updated successfully" });
};
const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  await cloudinaryRemoveImage(category.image.publicId);
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
};
