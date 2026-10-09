// Vercel serverless entry: serves the ShopKart Express API under /api on the
// same domain as the storefront, so the Strict session cookie keeps working.
process.env.NODE_ENV = "production";
const {
  app,
  connectDatabase,
} = require("../Lab-03-ShopKart-Product-Discovery/backend/index.js");

module.exports = async (req, res) => {
  const path = req.url.replace(/^\/api(?=[/?]|$)/, "");
  req.url = path.startsWith("/") ? path : `/${path}`;
  try {
    await connectDatabase();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify({
        success: false,
        message: "The store is briefly unavailable. Please try again shortly.",
      }),
    );
  }
  return app(req, res);
};
