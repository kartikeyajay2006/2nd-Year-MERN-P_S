const router = require("express").Router();
const { createProduct, getProducts, getProductById } = require("../controllers/product.controller");
router.route("/").post(createProduct).get(getProducts);
router.get("/:id", getProductById);
module.exports = router;
