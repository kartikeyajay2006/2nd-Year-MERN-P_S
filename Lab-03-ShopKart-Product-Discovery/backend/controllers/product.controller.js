const mongoose = require("mongoose");
const Product = require("../models/product.model");

function validationError({ name, description, price, category, image, stock }) {
  if (!name || !description || price === undefined || !category || !image || stock === undefined) return "Name, description, price, category, image and stock are required";
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) return "Price must be greater than 0";
  if (!Number.isInteger(stock) || stock < 0) return "Stock cannot be negative";
  return null;
}

exports.createProduct = async (req, res) => {
  try {
    const message = validationError(req.body);
    if (message) return res.status(400).json({ success: false, message });
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch { return res.status(500).json({ success: false, message: "Internal server error" }); }
};

exports.getProducts = async (req, res) => {
  try {
    const query = {};
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    if (search) query.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (category) query.category = category;
    const products = await Product.find(query).select("name price category image stock").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: products.length, products });
  } catch { return res.status(500).json({ success: false, message: "Internal server error" }); }
};

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch { return res.status(500).json({ success: false, message: "Internal server error" }); }
};
