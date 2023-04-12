const jwt = require("jsonwebtoken");

//create token
const createToken = ({ payload }) => {
  const token = jwt.sign(payload, process.env.SECRET_KEY);
  return token;
};
//valid token
const validToken = (token) => jwt.verify(token, process.env.SECRET_KEY);
//create cookies
const createCookie = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createToken({ payload: { user } });
  const refreshTokenJWT = createToken({ payload: { user, refreshToken } });

  //expired date
  const oneDay = 1000 * 60 * 60 * 24;
  const longExpire = 1000 * 60 * 60 * 24 * 30;
  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longExpire),
  });
};
module.exports = { validToken, createCookie };
