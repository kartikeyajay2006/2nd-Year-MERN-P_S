const mongoose = require("mongoose");

// The catalogue is the source of truth. The frontend only ever renders data
// returned from this collection; it does not keep a hard-coded product list.
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Product", productSchema);
