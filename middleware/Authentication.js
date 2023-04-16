const UnAuthentication = require("../error/UnAuthentication");
const UnAuthorized = require("../error/UnAuthorized");
const UserToken = require("../model/UserToken");
const { validToken, createCookie } = require("../utils/jwt");

const Authentication = async (req, res, next) => {
  const { accessToken, refreshToken } = req.signedCookies;
  try {
    if (accessToken) {
      const payload = validToken(accessToken);
      req.user = payload.user;
      return next();
    }
    //if there is no access token
    const payload = validToken(refreshToken);
    //check if there is an token
    const existToken = await UserToken.findOne({
      refreshToken: payload.refreshToken,
      user: payload.user.userId,
    });
    ///vendor token
    const vendorExistToken = await UserToken.findOne({
      refreshToken: payload.refreshToken,
      user: payload.user.vendorId,
    });
    //if there is no refreshToken
    if (!existToken) {
      throw new UnAuthentication("authentication invalid,please login");
    }
     //if there is no refreshToken
     if (!vendorExistToken) {
      throw new UnAuthentication("authentication invalid,please login");
    }
    //if there is a refreshToken create cookies
    createCookie({
      res,
      user: payload.user,
      refreshToken: payload.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnAuthentication("authentication invalid,please login");
  }
};
const authorizedPermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnAuthorized("you can't access this route");
    }
    next();
  };
};
module.exports = { Authentication, authorizedPermissions };
