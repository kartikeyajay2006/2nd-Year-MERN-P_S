const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

exports.registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone) return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    if (await Customer.findOne({ email })) return res.status(409).json({ success: false, message: "Email already exists" });
    const customer = await Customer.create({ fullName, email, password: await bcrypt.hash(password, 10), phone });
    return res.status(201).json({ success: true, message: "Customer registered successfully", customer: { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone } });
  } catch { return res.status(500).json({ success: false, message: "Internal server error" }); }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const customer = await Customer.findOne({ email });
    if (!customer || !(await bcrypt.compare(password, customer.password))) return res.status(401).json({ success: false, message: "Invalid credentials" });
    res.cookie("token", generateToken(customer._id), { httpOnly: true, secure: false, sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.status(200).json({ success: true, message: "Login successful", customer: { _id: customer._id, fullName: customer.fullName, email: customer.email, phone: customer.phone } });
  } catch { return res.status(500).json({ success: false, message: "Internal server error" }); }
};

exports.getMyProfile = (req, res) => res.status(200).json(req.user);
exports.logoutCustomer = (req, res) => { res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "strict" }); return res.status(200).json({ success: true, message: "Logged out successfully" }); };
