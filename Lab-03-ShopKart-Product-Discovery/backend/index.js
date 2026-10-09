require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");
const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
// Vite may be opened as either localhost or 127.0.0.1 during development.
// Accept both so the browser does not block a valid local API request.
// On Vercel, the deployment's own URLs are trusted as well.
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...[
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
  ]
    .filter(Boolean)
    .map((host) => `https://${host}`),
];
// Vercel's edge sets X-Forwarded-For; rate limits must key on the visitor.
if (process.env.VERCEL) app.set("trust proxy", 1);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    !allowedOrigins.includes(req.headers.origin)
  )
    return res.status(403).json({ message: "Request origin is not allowed" });
  next();
});
app.use(cookieParser());
app.use(
  "/customers/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "production" ? 20 : 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many sign-in attempts. Please try again later." },
  }),
);
app.use(
  "/customers/register",
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: process.env.NODE_ENV === "production" ? 10 : 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many accounts created. Please try again later." },
  }),
);
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.get("/health", (_req, res) =>
  res
    .status(mongoose.connection.readyState === 1 ? 200 : 503)
    .json({
      success: mongoose.connection.readyState === 1,
      database:
        mongoose.connection.readyState === 1 ? "connected" : "unavailable",
    }),
);

app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Request body must contain valid JSON",
      });
  }
  if (error.status)
    return res
      .status(error.status)
      .json({ success: false, message: error.message });
  console.error("Unhandled request error:", error.message);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
// Serverless instances handle many requests; connect once and reuse it.
let connection;
function connectDatabase() {
  const missingSettings = ["MONGO_URI", "JWT_SECRET"].filter(
    (key) => !process.env[key],
  );
  if (missingSettings.length) {
    return Promise.reject(
      new Error(
        `Missing required environment variable(s): ${missingSettings.join(", ")}`,
      ),
    );
  }
  connection ??= mongoose
    .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .catch((error) => {
      connection = undefined;
      throw error;
    });
  return connection;
}

async function startServer() {
  await connectDatabase();
  return app.listen(PORT, () =>
    console.log(`Product API running on port ${PORT}`),
  );
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Unable to start Product API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, connectDatabase, startServer };
