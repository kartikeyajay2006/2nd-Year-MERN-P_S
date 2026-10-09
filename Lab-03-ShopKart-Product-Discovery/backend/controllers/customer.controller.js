const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");
const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
exports.registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body || {};
    if (
      [fullName, email, password, phone].some(
        (value) => typeof value !== "string" || !value.trim(),
      )
    )
      return res.status(400).json({ message: "All fields are required" });
    if (fullName.trim().length < 2 || fullName.length > 100)
      return res
        .status(400)
        .json({ message: "Name must contain 2–100 characters" });
    if (!emailPattern.test(email.trim()) || email.length > 254)
      return res.status(400).json({ message: "Enter a valid email address" });
    if (!/^[6-9]\d{9}$/.test(phone.trim()))
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit Indian mobile number" });
    if (password.length < 8 || Buffer.byteLength(password) > 72)
      return res
        .status(400)
        .json({
          message:
            "Password must have at least 8 characters and at most 72 bytes",
        });
    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 12),
      phone: phone.trim(),
    });
    return res
      .status(201)
      .json({
        success: true,
        message: "Account created. You can now sign in.",
        customer: {
          _id: customer._id,
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        },
      });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    next(error);
  }
};
exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    )
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    const customer = await Customer.findOne({
      email: email.trim().toLowerCase(),
    });
    if (!customer || !(await bcrypt.compare(password, customer.password)))
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    res.cookie("token", generateToken(customer._id), {
      ...cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      success: true,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};
exports.getMyProfile = (req, res) =>
  res.json({
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone,
  });
exports.logoutCustomer = (_req, res) => {
  res.clearCookie("token", cookieOptions());
  return res.json({ success: true });
};
