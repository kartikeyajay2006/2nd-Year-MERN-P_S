const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
async function snapshot(userId, address, session) {
  const fields = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];
  if (
    !address ||
    fields.some(
      (field) =>
        typeof address[field] !== "string" ||
        !address[field].trim() ||
        address[field].length > 300,
    )
  )
    throw fail("Complete all shipping details");
  if (!/^[6-9]\d{9}$/.test(address.phone.trim()))
    throw fail("Enter a valid 10-digit Indian mobile number");
  if (!/^\d{6}$/.test(address.pincode.trim()))
    throw fail("Pincode must contain 6 digits");
  const customer = await Customer.findById(userId).session(session || null);
  if (!customer?.cart.length) throw fail("Your cart is empty");
  const products = await Product.find({
    _id: { $in: customer.cart.map((line) => line.product) },
  }).session(session || null);
  const items = customer.cart.map((line) => {
    const product = products.find((item) => item._id.equals(line.product));
    if (!product)
      throw fail(
        "A cart product is no longer available. Remove it to continue.",
      );
    if (line.quantity > product.stock)
      throw fail(
        `Only ${product.stock} units available for ${product.name}`,
        409,
      );
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      image: product.image,
    };
  });
  return {
    user: userId,
    items,
    shippingAddress: Object.fromEntries(
      fields.map((field) => [field, address[field].trim()]),
    ),
    totalAmount:
      items.reduce(
        (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
        0,
      ) / 100,
  };
}
async function consumeInventory(order, session) {
  for (const item of order.items) {
    const result = await Product.updateOne(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { session },
    );
    if (!result.modifiedCount)
      throw fail(
        `Stock changed for ${item.name}. Please refresh your cart.`,
        409,
      );
  }
  // Preserve new products and extra quantities added after payment began.
  const customer = await Customer.findById(order.user).session(session);
  for (const item of order.items) {
    const line = customer.cart.find((line) =>
      line.product.equals(item.product),
    );
    if (line) line.quantity -= item.quantity;
  }
  customer.cart = customer.cart.filter((line) => line.quantity > 0);
  await customer.save({ session });
}
async function placeCod(userId, address) {
  return mongoose.connection.transaction(async (session) => {
    const data = await snapshot(userId, address, session);
    const [order] = await Order.create(
      [{ ...data, paymentMethod: "COD", status: "PLACED" }],
      { session },
    );
    await consumeInventory(order, session);
    return order;
  });
}
module.exports = { snapshot, consumeInventory, placeCod, fail };
