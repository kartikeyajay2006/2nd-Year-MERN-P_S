const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");

exports.getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });
    if (!customer)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const wishlist = customer.wishlist.filter(Boolean);
    return res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    next(error);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    if (!(await Product.exists({ _id: productId })))
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    const result = await Customer.updateOne(
      {
        _id: req.user._id,
        wishlist: { $ne: new mongoose.Types.ObjectId(productId) },
      },
      { $addToSet: { wishlist: productId } },
    );
    if (!result.modifiedCount)
      return res
        .status(409)
        .json({
          success: false,
          message: "Product is already in your wishlist",
        });
    return res
      .status(201)
      .json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
    );
    if (!result.modifiedCount)
      return res
        .status(404)
        .json({ success: false, message: "Product is not in your wishlist" });
    return res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};
