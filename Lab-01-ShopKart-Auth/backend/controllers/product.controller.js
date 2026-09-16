const mongoose = require("mongoose");
const Product = require("../models/product.model");

function productValidationMessage({ name, description, price, category, image, stock }) {
  if (!name || !description || price === undefined || !category || !image || stock === undefined) {
    return "Name, description, price, category, image and stock are required";
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return "Price must be a number greater than 0";
  }
  if (!Number.isInteger(stock) || stock < 0) {
    return "Stock must be a whole number greater than or equal to 0";
  }
  return null;
}

// POST /products — intentionally open for this lab; admin permissions come later.
const createProduct = async (req, res) => {
  try {
    const validationError = productValidationMessage(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /products?search=keyboard&category=Electronics
const getProducts = async (req, res) => {
  try {
    const query = {};
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();

    // Escape user input so a search phrase is treated as text, not a regular expression.
    if (search) query.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (category) query.category = category;

    const products = await Product.find(query)
      .select("name price category image stock")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /products/:id
const getProductById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createProduct, getProducts, getProductById };
