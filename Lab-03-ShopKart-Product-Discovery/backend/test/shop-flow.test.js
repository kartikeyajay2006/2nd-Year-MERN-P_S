const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
const nock = require("nock");

process.env.JWT_SECRET = "test-jwt-secret-for-shopkart";
process.env.RAZORPAY_KEY_ID = "rzp_test_shopkart";
process.env.RAZORPAY_KEY_SECRET = "test-razorpay-secret";
const { app } = require("../index");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
let mongo;

before(async () => { mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); });
after(async () => { nock.cleanAll(); await mongoose.disconnect(); await mongo?.stop(); });

async function login(email) {
  await request(app).post("/customers/register").send({ fullName: email.split("@")[0], email, password: "password123", phone: "9876543210" }).expect(201);
  const response = await request(app).post("/customers/login").send({ email, password: "password123" }).expect(200);
  return response.headers["set-cookie"][0].split(";")[0];
}

test("wishlist, cart, payment verification and order ownership stay connected", async () => {
  const first = await login("first@example.com");
  const second = await login("second@example.com");
  const product = await Product.create({ name: "Test Keyboard", description: "For end-to-end API tests", price: 2499, category: "Electronics", image: "https://example.com/keyboard.jpg", stock: 2 });
  const id = String(product._id);

  await request(app).get("/wishlist").expect(401);
  await request(app).post(`/wishlist/${id}`).set("Cookie", first).expect(201);
  await request(app).post(`/wishlist/${id}`).set("Cookie", first).expect(409);
  const wishlist = await request(app).get("/wishlist").set("Cookie", first).expect(200);
  assert.equal(wishlist.body.wishlist[0].name, "Test Keyboard");
  assert.equal((await request(app).get("/wishlist").set("Cookie", second).expect(200)).body.count, 0);
  await request(app).delete(`/wishlist/${id}`).set("Cookie", first).expect(200);

  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(200);
  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(200);
  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(400);
  await request(app).patch(`/cart/${id}`).set("Cookie", first).send({ quantity: 0 }).expect(400);
  await request(app).patch(`/cart/${id}`).set("Cookie", first).send({ quantity: 3 }).expect(400);
  assert.equal((await request(app).get("/cart").set("Cookie", first).expect(200)).body.cart[0].quantity, 2);

  const pendingPaymentId = "order_test_shopkart_01";
  nock("https://api.razorpay.com").post("/v1/orders", (body) => body.amount === 499800 && body.currency === "INR").reply(200, { id: pendingPaymentId, entity: "order", amount: 499800, currency: "INR" });
  const shippingAddress = { fullName: "Aarav Sharma", phone: "9876543210", addressLine1: "22 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" };
  const payment = await request(app).post("/orders/create-payment-order").set("Cookie", first).send({ shippingAddress, totalAmount: 1 }).expect(201);
  assert.equal(payment.body.amount, 499800);
  const orderId = payment.body.shopKartOrderId;
  assert.equal((await Order.findById(orderId)).totalAmount, 4998);
  assert.equal((await request(app).get("/cart").set("Cookie", first).expect(200)).body.cart.length, 1);
  await request(app).post("/orders/verify-payment").set("Cookie", first).send({ shopKartOrderId: orderId, razorpay_order_id: pendingPaymentId, razorpay_payment_id: "pay_test_01", razorpay_signature: "a".repeat(64) }).expect(400);
  assert.equal((await Order.findById(orderId)).paymentStatus, "PENDING");
  const signature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${pendingPaymentId}|pay_test_01`).digest("hex");
  await request(app).post("/orders/verify-payment").set("Cookie", first).send({ shopKartOrderId: orderId, razorpay_order_id: pendingPaymentId, razorpay_payment_id: "pay_test_01", razorpay_signature: signature }).expect(200);
  assert.equal((await request(app).get("/cart").set("Cookie", first).expect(200)).body.cart.length, 0);
  assert.equal((await request(app).get(`/orders/${orderId}`).set("Cookie", first).expect(200)).body.order.status, "PLACED");
  await request(app).get(`/orders/${orderId}`).set("Cookie", second).expect(404);
  assert.equal((await request(app).get("/orders").set("Cookie", second).expect(200)).body.orders.length, 0);
  assert.equal(nock.pendingMocks().length, 0);
});
