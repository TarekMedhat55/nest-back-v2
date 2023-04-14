require("dotenv").config();
require("express-async-errors");

const { default: mongoose } = require("mongoose");
const express = require("express");
const { NotFoundMiddleware } = require("./middleware/NotFoundMiddleware");
const ErrorHandlerMiddleware = require("./middleware/ErrorHandlerMiddlerware");
const app = express();
const cookieParser = require("cookie-parser");
const authRouter = require("./router/auth");
const vendorRouter = require("./router/vendor");
const categoryRouter = require("./router/category");
const productRouter = require("./router/product");
const reviewRouter = require("./router/review");
const wishlistRouter = require("./router/wishlist");
const addressRouter = require("./router/address");
const compareRouter = require("./router/compare");
const cartRouter = require("./router/cart");
const couponRouter = require("./router/coupon");
const orderRouter = require("./router/order");
const path = require("path");

app.use(express.json());
app.use(cookieParser(process.env.SECRET_KEY));

app.use("/api/auth", authRouter);
app.use("/api/vendor-auth", vendorRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/address", addressRouter);
app.use("/api/compare", compareRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/orders", orderRouter);
app.use(express.static(path.join(__dirname, "uploads")));

app.use(NotFoundMiddleware);
app.use(ErrorHandlerMiddleware);
//const port and database
const port = process.env.PORT || 8000;
const start = async (req, res) => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose
      .connect(process.env.DATABASE)
      .then(() => console.log("database connected"))
      .catch((error) => console.log("Error", error));
    app.listen(port, () => console.log(`server is running on port ${port}`));
  } catch (error) {
    console.log("Error", error);
  }
};

start();
