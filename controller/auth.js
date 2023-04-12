const BadRequestError = require("../error/BadRequestError");
const User = require("../model/User");
const crypto = require("crypto");
const { createCookie } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const UnAuthentication = require("../error/UnAuthentication");
const UserToken = require("../model/UserToken");
const NotFoundError = require("../error/NotFoundError");
const { sendEmail } = require("../utils/SendEmail");
const userRegister = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError("all fields are required");
  }
  //check email
  const checkEmail = await User.findOne({ email });
  if (checkEmail) {
    throw new BadRequestError("this email is taken");
  }
  //generate refresh token
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });
  //user token
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  const refreshToken = crypto.randomBytes(40).toString("hex");
  //create token
  await UserToken.create({ refreshToken, user: user._id });
  createCookie({ res, user: userToken, refreshToken });
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  res.status(StatusCodes.CREATED).json({ userInfo });
};
/**login user */
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  //check user email
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnAuthentication("email is not exist");
  }
  //check user password
  const passwordCorrect = await user.comparePassword(password);
  if (!passwordCorrect) {
    throw new UnAuthentication("password not correct");
  }
  //user token
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //user info
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //check refreshToken
  let refreshToken = "";
  const refreshTokenExist = await UserToken.findOne({ user: user._id });
  if (refreshTokenExist) {
    refreshToken = refreshTokenExist.refreshToken;
    //create cookies
    createCookie({ res, user: userToken, refreshToken });
    res.status(StatusCodes.OK).json({ userInfo });
    return;
  }
  //if refreshToken exist
  refreshToken = crypto.randomBytes(40).toString("hex");
  //create token
  await UserToken.create({ refreshToken, user: user._id });
  createCookie({ res, user: userToken, refreshToken });
  res.status(StatusCodes.OK).json({ userInfo });
};
//logout
const logoutUser = async (req, res) => {
  await UserToken.findOneAndDelete({ user: req.user.userId });
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
const userForgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("email is required");
  }
  //check user
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("email is not exist");
  }
  //generate reset code
  const resetCode = Math.floor(
    100000000 + Math.random() * 900000000
  ).toString();
  //hash reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();
  const expireDate = new Date(Date.now() + 1000 * 60 * 10);
  user.passwordResetCode = hashResetCode;
  user.passwordResetCodeExpire = expireDate;
  user.passwordResetCodeValid = undefined;
  await user.save();

  //send message
  const message = `Hi ${user.firstName} ${user.lastName},\n We received a request to reset the password on your Nest E-commerce Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The Nest E-commerce Team`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpire = undefined;
    user.passwordResetCodeValid = undefined;
    await user.save();
    throw new BadRequestError(
      "there is a problem with sending email,try later"
    );
  }
  res.status(StatusCodes.OK).json({ msg: "reset code sended to your email" });
};
//reset code
const userResetCode = async (req, res) => {
  const { resetCode } = req.body;
  if (!resetCode) {
    throw new BadRequestError("reset code is required");
  }
  //reset code hash
  const resetCodeHash = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")
    .toString();

  const user = await User.findOne({ passwordResetCode: resetCodeHash });
  if (!user) {
    throw new BadRequestError("reset code not valid");
  }
  if (user.passwordResetCodeExpire < Date.now()) {
    throw new BadRequestError("reset code expired");
  }
  user.passwordResetCodeValid = true;
  user.save();
  res.status(StatusCodes.OK).json({ msg: "success" });
};
const userChangePassword = async (req, res) => {
  const { password, email } = req.body;
  if (!email || !password) {
    throw new BadRequestError("all fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("this user is not exist");
  }
  if (!user.passwordResetCodeValid) {
    throw new BadRequestError("you cant make this action");
  }
  user.password = password;
  user.passwordCorrect = undefined;
  user.passwordResetCodeExpire = undefined;
  user.passwordResetCodeValid = undefined;
  await user.save();
  //generate cookies
  let refreshToken = "";
  const userToken = {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //const user info
  const userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
  //token exist
  const tokenExist = await UserToken.findOne({ user: user._id });
  if (tokenExist) {
    refreshToken = tokenExist.refreshToken;
    createCookie({ res, user: userToken, refreshToken });
    res.status(StatusCodes.OK).json({ user: userInfo });
    return;
  }
  //generate refreshToken
  refreshToken = crypto.randomBytes(40).toString();
  createCookie({ res, user: userToken, refreshToken });
  res.status(StatusCodes.OK).json({ user: userInfo });
};
module.exports = {
  userRegister,
  userLogin,
  logoutUser,
  userForgetPassword,
  userResetCode,
  userChangePassword,
};
