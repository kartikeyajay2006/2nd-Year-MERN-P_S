require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/product.routes");

const app = express();
// Vite may be opened as either localhost or 127.0.0.1 during development.
// Accept both so the browser does not block a valid local API request.
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5174",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/products", productRoutes);

const PORT = process.env.PORT || 3001;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Product API running on port ${PORT}`)))
  .catch((error) => console.error("MongoDB connection failed:", error.message));
