const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

async function sendCart(res, userId, message = "Cart updated") {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price category image stock",
  });
  return res.json({
    success: true,
    message,
    cart: customer.cart.filter((item) => item.product),
  });
}

exports.getCart = async (req, res, next) => {
  try {
    return await sendCart(res, req.user._id);
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    // Increment an existing line atomically so rapid clicks cannot exceed stock.
    const updated = await Customer.updateOne(
      {
        _id: req.user._id,
        cart: {
          $elemMatch: {
            product: product._id,
            quantity: { $lt: product.stock },
          },
        },
      },
      { $inc: { "cart.$.quantity": 1 } },
    );
    if (updated.modifiedCount) return await sendCart(res, req.user._id);
    const added =
      product.stock > 0 &&
      (await Customer.updateOne(
        { _id: req.user._id, "cart.product": { $ne: product._id } },
        { $push: { cart: { product: product._id, quantity: 1 } } },
      ));
    if (!added?.modifiedCount)
      return res
        .status(400)
        .json({
          success: false,
          message: `Only ${product.stock} units available for ${product.name}`,
        });
    return await sendCart(res, req.user._id);
  } catch (error) {
    next(error);
  }
};

exports.updateQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    const { quantity } = req.body || {};
    if (!Number.isInteger(quantity) || quantity < 1)
      return res
        .status(400)
        .json({
          success: false,
          message: "Quantity must be a whole number of at least 1",
        });
    const product = await Product.findById(productId);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    if (quantity > product.stock)
      return res
        .status(400)
        .json({
          success: false,
          message: `Only ${product.stock} units available for ${product.name}`,
        });
    const result = await Customer.updateOne(
      { _id: req.user._id, "cart.product": product._id },
      { $set: { "cart.$.quantity": quantity } },
    );
    if (!result.matchedCount)
      return res
        .status(404)
        .json({ success: false, message: "Product is not in your cart" });
    return await sendCart(res, req.user._id);
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    const result = await Customer.updateOne(
      { _id: req.user._id, "cart.product": productId },
      { $pull: { cart: { product: productId } } },
    );
    if (!result.modifiedCount)
      return res
        .status(404)
        .json({ success: false, message: "Product is not in your cart" });
    return await sendCart(res, req.user._id);
  } catch (error) {
    next(error);
  }
};
