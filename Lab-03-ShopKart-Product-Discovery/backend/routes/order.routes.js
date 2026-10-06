const router = require("express").Router();
const protect = require("../middlewares/auth.middleware");
const orders = require("../controllers/order.controller");
router.use(protect);
router.post("/create-payment-order", orders.createPaymentOrder);
router.post("/verify-payment", orders.verifyPayment);
router.get("/", orders.getOrders);
router.get("/:id", orders.getOrder);
module.exports = router;
