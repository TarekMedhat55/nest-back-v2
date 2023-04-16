const BadRequestError = require("../error/BadRequestError");
const Vendor = require("../model/Vendor");
const crypto = require("crypto");
const VendorToken = require("../model/VendorToken");
const { createCookie } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const UnAuthentication = require("../error/UnAuthentication");
const { sendEmail } = require("../utils/SendEmail");
const vendorRegister = async (req, res) => {
  const { companyName, firstName, lastName, email, password, phoneNumber } =
    req.body;
  if (
    !companyName ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phoneNumber
  ) {
    throw new BadRequestError("all fields are required");
  }
  //check vendor email
  const checkEmail = await Vendor.findOne({ email });
  if (checkEmail) {
    throw new BadRequestError("this email is taken");
  }
  //check vendor name
  const vendor = await Vendor.create({
    firstName,
    lastName,
    email,
    password,
    companyName,
    phoneNumber,
  });
  //generate refresh token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  //create token
  await VendorToken.create({ refreshToken, vendor: vendor._id });
  //create cookies
  const vendorTokenItem = {
    vendorId: vendor._id,
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  createCookie({ res, user: vendorTokenItem, refreshToken });
  //create vendor info
  const vendorInfo = {
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  res.status(StatusCodes.CREATED).json({ vendor: vendorInfo });
};
//vendor login
const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  //check email
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new UnAuthentication("this email is not exist");
  }
  //check password
  const passwordCorrect = await vendor.comparePassword(password);
  if (!passwordCorrect) {
    throw new UnAuthentication("password not correct");
  }
  //create cookies
  const vendorTokenItem = {
    vendorId: vendor._id,
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  //create vendor info
  const vendorInfo = {
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  //check refreshToken
  let refreshToken = "";
  const tokenExist = await VendorToken({ vendor: vendor._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    //create cookies
    createCookie({ res, user: vendorTokenItem, refreshToken });
    res.status(StatusCodes.OK).json({ vendor: vendorInfo });
    return;
  }
  //generate refresh token
  refreshToken = crypto.randomBytes(40).toString();
  //create refresh token
  await VendorToken.create({ refreshToken, vendor: vendor._id });
  //create cookies
  createCookie({ res, user: vendorTokenItem, refreshToken });
  res.status(StatusCodes.OK).json({ vendor: vendorInfo });
};

//logout
const vendorLogout = async (req, res) => {
  await VendorToken.findOneAndDelete({ vendor: req.user.userId });
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "logout" });
};
//forget password
const vendorForgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("email is require");
  }
  //check email
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    throw new UnAuthentication("this email is not exist");
  }
  //generate reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  //hash reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  const expireDate = new Date(Date.now() + 1000 * 60 * 10);
  vendor.passwordResetCode = hashResetCode;
  vendor.passwordResetCodeExpired = expireDate;
  vendor.passwordResetCodeValid = undefined;
  await vendor.save();
  //send message
  const message = `Hi ${vendor.firstName} ${vendor.lastName},\n We received a request to reset the password on your Nest E-commerce Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Nest E-commerce Team`;

  try {
    await sendEmail({
      email: vendor.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (error) {
    vendor.passwordResetCode = undefined;
    vendor.passwordResetCodeExpired = undefined;
    vendor.passwordResetCodeValid = undefined;
    await vendor.save();
    throw new BadRequestError(
      "there is a problem with sending email,try later"
    );
  }
  res.status(StatusCodes.OK).json({ msg: "reset code sended to your email" });
};
const vendorResetCode = async (req, res) => {
  const { resetCode } = req.body;
  if (!resetCode) {
    throw new BadRequestError("reset code is required");
  }
  //reset code hash
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  //get vendor
  const vendor = await Vendor.findOne({ passwordResetCode: hashResetCode });
  if (!vendor) {
    throw new BadRequestError("reset code not valid");
  }
  //check date
  if (vendor.passwordResetCodeExpired < Date.now()) {
    throw new BadRequestError("reset code expired");
  }
  vendor.passwordResetCodeValid = true;
  vendor.save();
  res.status(StatusCodes.OK).json({ status: "success" });
};
const vendorChangePassword = async (req, res) => {
  const { password, email } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  const vendor = await Vendor.findOne({ email });
  if (!vendor.passwordResetCodeValid) {
    throw new BadRequestError("you can not make this action");
  }
  vendor.password = password;
  vendor.passwordResetCode = undefined;
  vendor.passwordResetCodeExpired = undefined;
  vendor.passwordResetCodeValid = undefined;
  vendor.save();
  //create cookies
  const vendorTokenItem = {
    vendorId: vendor._id,
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  //create vendor info
  const vendorInfo = {
    firstName: vendor.firstName,
    lastName: vendor.lastName,
    email: vendor.email,
    role: vendor.role,
  };
  //check refresh token
  let refreshToken = "";
  const tokenExist = await VendorToken({ vendor: vendor._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    //create cookies
    createCookie({ res, user: vendorTokenItem });
    res.status(StatusCodes.OK).json({ vendor: vendorInfo });
    return;
  }
  //generate refresh token
  refreshToken = crypto.randomBytes(40).toString();
  //create refresh token
  await VendorToken.create({ refreshToken, vendor: vendor._id });
  //create cookies
  createCookie({ res, user: vendorTokenItem, refreshToken });
  res.status(StatusCodes.OK).json({ vendor: vendorInfo });
};
module.exports = {
  vendorRegister,
  vendorLogin,
  vendorLogout,
  vendorForgetPassword,
  vendorResetCode,
  vendorChangePassword,
};
