const router = require("express").Router();
const { registerCustomer, loginCustomer, getMyProfile, logoutCustomer } = require("../controllers/customer.controller");
const protect = require("../middlewares/auth.middleware");
router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/me", protect, getMyProfile);
router.post("/logout", protect, logoutCustomer);
module.exports = router;
