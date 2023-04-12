class CustomApi extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = CustomApi;
