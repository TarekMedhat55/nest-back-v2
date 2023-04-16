const multer = require("multer");
const BadRequestError = require("../error/BadRequestError");

//we will use memory storage to save it in buffer
const multerStorage = multer.memoryStorage();
//filter images to upload images only
const multerFilter = function (req, file, callBack) {
  console.log(file.mimetype);
  //file=>mimetype:image/jpeg
  if (file.mimetype.startsWith("image")) {
    //no error
    callBack(null, true);
  } else {
    callBack(new BadRequestError("only images allowed"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1024 * 1024 },
}); // limit 1 megabyte if we want 2 use *
const uploadSingleImage = upload.single("imageCover");

module.exports = { uploadSingleImage };
