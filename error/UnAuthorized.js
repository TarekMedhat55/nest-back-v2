const { StatusCodes } = require("http-status-codes");
const CustomApi = require("./CustomApi");
class UnAuthorized extends CustomApi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnAuthorized;
