const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const cart = require("../controllers/cart.controller");
router.use(protect);
router.get("/", cart.getCart);
router.post("/:productId", cart.addToCart);
router.patch("/:productId", cart.updateQuantity);
router.delete("/:productId", cart.removeFromCart);
module.exports = router;
