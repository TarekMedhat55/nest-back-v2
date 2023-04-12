const { StatusCodes } = require("http-status-codes");
const CustomApi = require("./CustomApi");

class UnAuthentication extends CustomApi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnAuthentication;
