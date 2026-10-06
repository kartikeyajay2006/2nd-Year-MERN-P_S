require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
// Vite may be opened as either localhost or 127.0.0.1 during development.
// Accept both so the browser does not block a valid local API request.
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.get("/health", (_req, res) => res.status(200).json({ success: true, message: "Product API is healthy" }));

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON" });
  }
  console.error("Unhandled request error:", error.message);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
async function startServer() {
  const missingSettings = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
  if (missingSettings.length) {
    throw new Error(`Missing required environment variable(s): ${missingSettings.join(", ")}`);
  }

  await mongoose.connect(process.env.MONGO_URI);
  return app.listen(PORT, () => console.log(`Product API running on port ${PORT}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start Product API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
