const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const wishlist = require("../controllers/wishlist.controller");
router.use(protect);
router.get("/", wishlist.getWishlist);
router.post("/:productId", wishlist.addToWishlist);
router.delete("/:productId", wishlist.removeFromWishlist);
module.exports = router;
