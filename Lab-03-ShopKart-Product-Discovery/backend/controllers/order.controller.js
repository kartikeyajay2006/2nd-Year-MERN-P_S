const crypto = require("node:crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Order = require("../models/order.model");
const { snapshot, consumeInventory, placeCod } = require("../utils/order");

function validateAddress(address) {
  if (!address || typeof address !== "object" || Array.isArray(address))
    return "Shipping address is required";
  for (const field of [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ]) {
    if (typeof address[field] !== "string" || !address[field].trim())
      return `${field} is required`;
  }
  if (!/^[6-9]\d{9}$/.test(address.phone.trim()))
    return "Phone must be a valid 10-digit Indian mobile number";
  if (!/^\d{6}$/.test(address.pincode.trim()))
    return "Pincode must contain 6 digits";
  return null;
}

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const error = validateAddress(req.body?.shippingAddress);
    if (error) return res.status(400).json({ success: false, message: error });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(503)
        .json({
          success: false,
          message:
            "Test payments are not configured yet. Add Razorpay test keys to the backend environment.",
        });
    }
    if (
      !process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_") ||
      process.env.RAZORPAY_KEY_ID.includes("replace")
    )
      return res
        .status(503)
        .json({
          message: "Add valid Razorpay test keys or choose cash on delivery.",
        });
    const data = await snapshot(req.user._id, req.body.shippingAddress);
    const order = await Order.create(data);
    const totalAmount = data.totalAmount;
    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const paymentOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: String(order._id),
      });
      order.razorpayOrderId = paymentOrder.id;
      await order.save();
      return res
        .status(201)
        .json({
          success: true,
          shopKartOrderId: order._id,
          razorpayOrderId: paymentOrder.id,
          amount: paymentOrder.amount,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
        });
    } catch (paymentError) {
      await Order.deleteOne({
        _id: order._id,
        razorpayOrderId: { $exists: false },
      });
      console.error("Razorpay order creation failed:", paymentError.message);
      return res
        .status(502)
        .json({
          success: false,
          message: "Payment service is unavailable. Please try again.",
        });
    }
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};
    if (
      !mongoose.isValidObjectId(shopKartOrderId) ||
      [razorpay_order_id, razorpay_payment_id, razorpay_signature].some(
        (value) => typeof value !== "string" || !value,
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Valid payment details are required",
        });
    }
    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id)
      return res
        .status(400)
        .json({ success: false, message: "Payment order does not match" });
    if (!process.env.RAZORPAY_KEY_SECRET)
      return res
        .status(503)
        .json({
          success: false,
          message: "Payment verification is unavailable",
        });
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");
    if (!/^[a-f0-9]{64}$/i.test(razorpay_signature))
      return res.status(400).json({ message: "Invalid payment signature" });
    const supplied = Buffer.from(razorpay_signature, "hex");
    if (
      supplied.length !== 32 ||
      !crypto.timingSafeEqual(Buffer.from(expected, "hex"), supplied)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId !== razorpay_payment_id)
        return res
          .status(409)
          .json({
            success: false,
            message: "Order was paid with a different payment",
          });
      return res.json({ success: true, order });
    }
    const paid = await mongoose.connection.transaction(async (session) => {
      const current = await Order.findOne({
        _id: order._id,
        user: req.user._id,
      }).session(session);
      if (current.paymentStatus === "PAID") {
        if (current.razorpayPaymentId !== razorpay_payment_id)
          throw Object.assign(
            new Error("Order was paid with a different payment"),
            { status: 409 },
          );
        return current;
      }
      await consumeInventory(current, session);
      current.paymentStatus = "PAID";
      current.status = "PLACED";
      current.razorpayPaymentId = razorpay_payment_id;
      await current.save({ session });
      return current;
    });
    return res.json({ success: true, order: paid });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID" });
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.placeCodOrder = async (req, res, next) => {
  try {
    const order = await placeCod(req.user._id, req.body?.shippingAddress);
    return res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
