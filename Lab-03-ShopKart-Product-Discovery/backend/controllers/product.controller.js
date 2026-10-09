const mongoose = require("mongoose");
const Product = require("../models/product.model");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.getProducts = async (req, res) => {
  try {
    if (
      ["search", "category"].some(
        (key) =>
          req.query[key] !== undefined &&
          (typeof req.query[key] !== "string" || req.query[key].length > 120),
      )
    )
      return res.status(400).json({
        message: "Search and category must be text up to 120 characters",
      });
    const query = {};
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    if (search) query.name = { $regex: escapeRegex(search), $options: "i" };
    if (category)
      query.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
    const products = await Product.find(query)
      .select("name price category image stock")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, count: products.length, products });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
