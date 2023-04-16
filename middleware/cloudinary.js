const cloudinary = require("cloudinary").v2;

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//upload image
const cloudinaryUploadImage = async (fileUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileUpload, {
      resource_type: "auto",
    });
    return data;
  } catch (error) {
    return error;
  }
};
//remove image
const cloudinaryRemoveImage = async (imagePublic) => {
  try {
    const data = await cloudinary.uploader.destroy(imagePublic);
    return data;
  } catch (error) {
    return error;
  }
};

module.exports = { cloudinaryUploadImage, cloudinaryRemoveImage };
