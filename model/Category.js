const { default: mongoose } = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "category name is required"],
    unique: true,
  },
  image: String,
});

module.exports = mongoose.model("Category", CategorySchema);
