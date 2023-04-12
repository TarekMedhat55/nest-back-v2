const CustomApi = require("./CustomApi");
const { StatusCodes } = require("http-status-codes");

class NotFoundError extends CustomApi {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND;
  }
}
module.exports = NotFoundError;
