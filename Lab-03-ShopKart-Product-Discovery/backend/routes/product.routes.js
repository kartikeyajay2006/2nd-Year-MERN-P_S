const router = require("express").Router();
const {
  getProducts,
  getProductById,
} = require("../controllers/product.controller");
// Catalog writes are restricted to the seed script; there is no public admin role.
router.get("/", getProducts);
router.get("/:id", getProductById);
module.exports = router;
