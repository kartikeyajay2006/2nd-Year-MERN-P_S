const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(id).select("-password");
    if (!customer) return res.status(401).json({ success: false, message: "Unauthorized" });
    req.user = customer;
    next();
  } catch { return res.status(401).json({ success: false, message: "Unauthorized" }); }
};
