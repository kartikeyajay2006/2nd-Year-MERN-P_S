const crypto = require("node:crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

function validateAddress(address) {
  if (!address || typeof address !== "object" || Array.isArray(address)) return "Shipping address is required";
  for (const field of ["fullName", "phone", "addressLine1", "city", "state", "pincode"]) {
    if (typeof address[field] !== "string" || !address[field].trim()) return `${field} is required`;
  }
  if (!/^[6-9]\d{9}$/.test(address.phone.trim())) return "Phone must be a valid 10-digit Indian mobile number";
  if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits";
  return null;
}

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const error = validateAddress(req.body?.shippingAddress);
    if (error) return res.status(400).json({ success: false, message: error });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ success: false, message: "Test payments are not configured yet. Add Razorpay test keys to the backend environment." });
    }
    const customer = await Customer.findById(req.user._id);
    if (!customer?.cart.length) return res.status(400).json({ success: false, message: "Your cart is empty" });
    const products = await Product.find({ _id: { $in: customer.cart.map((item) => item.product) } });
    const byId = new Map(products.map((product) => [String(product._id), product]));
    const items = [];
    for (const line of customer.cart) {
      const product = byId.get(String(line.product));
      if (!product) return res.status(400).json({ success: false, message: "A product in your cart is no longer available. Remove it to continue." });
      if (line.quantity > product.stock) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} left.` });
      items.push({ product: product._id, name: product.name, price: product.price, quantity: line.quantity, image: product.image });
    }
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    const shippingAddress = Object.fromEntries(fields.map((field) => [field, req.body.shippingAddress[field].trim()]));
    const order = await Order.create({ user: customer._id, items, shippingAddress, totalAmount });
    try {
      const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      const paymentOrder = await razorpay.orders.create({ amount: Math.round(totalAmount * 100), currency: "INR", receipt: String(order._id) });
      order.razorpayOrderId = paymentOrder.id;
      await order.save();
      return res.status(201).json({ success: true, shopKartOrderId: order._id, razorpayOrderId: paymentOrder.id, amount: paymentOrder.amount, currency: "INR", key: process.env.RAZORPAY_KEY_ID });
    } catch (paymentError) {
      await Order.deleteOne({ _id: order._id, razorpayOrderId: { $exists: false } });
      console.error("Razorpay order creation failed:", paymentError.message);
      return res.status(502).json({ success: false, message: "Payment service is unavailable. Please try again." });
    }
  } catch (error) { next(error); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!mongoose.isValidObjectId(shopKartOrderId) || [razorpay_order_id, razorpay_payment_id, razorpay_signature].some((value) => typeof value !== "string" || !value)) {
      return res.status(400).json({ success: false, message: "Valid payment details are required" });
    }
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ success: false, message: "Payment order does not match" });
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ success: false, message: "Payment verification is unavailable" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest("hex");
    const supplied = Buffer.from(razorpay_signature, "hex");
    if (supplied.length !== 32 || !crypto.timingSafeEqual(Buffer.from(expected, "hex"), supplied)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId !== razorpay_payment_id) return res.status(409).json({ success: false, message: "Order was paid with a different payment" });
      return res.json({ success: true, order });
    }
    const paid = await Order.findOneAndUpdate(
      { _id: order._id, user: req.user._id, paymentStatus: "PENDING" },
      { $set: { paymentStatus: "PAID", status: "PLACED", razorpayPaymentId: razorpay_payment_id } },
      { returnDocument: "after" }
    );
    if (!paid) return res.status(409).json({ success: false, message: "Order payment has already been processed" });
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });
    return res.json({ success: true, order: paid });
  } catch (error) { next(error); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) { next(error); }
};

exports.getOrder = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid order ID" });
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) { next(error); }
};
