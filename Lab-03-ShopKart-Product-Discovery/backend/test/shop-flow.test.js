const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const request = require("supertest");
const nock = require("nock");

process.env.JWT_SECRET = "test-jwt-secret-for-shopkart";
process.env.RAZORPAY_KEY_ID = "rzp_test_shopkart";
process.env.RAZORPAY_KEY_SECRET = "test-razorpay-secret";
const { app } = require("../index");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
let mongo;

before(async () => {
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  await mongoose.connect(mongo.getUri());
});
after(async () => {
  nock.cleanAll();
  await mongoose.disconnect();
  await mongo?.stop();
});

async function login(email) {
  await request(app)
    .post("/customers/register")
    .send({
      fullName: email.split("@")[0],
      email,
      password: "password123",
      phone: "9876543210",
    })
    .expect(201);
  const response = await request(app)
    .post("/customers/login")
    .send({ email, password: "password123" })
    .expect(200);
  return response.headers["set-cookie"][0].split(";")[0];
}

test("wishlist, cart, payment verification and order ownership stay connected", async () => {
  const first = await login("first@example.com");
  const second = await login("second@example.com");
  const product = await Product.create({
    name: "Test Keyboard",
    description: "For end-to-end API tests",
    price: 2499,
    category: "Electronics",
    image: "https://example.com/keyboard.jpg",
    stock: 2,
  });
  const id = String(product._id);

  await request(app).get("/wishlist").expect(401);
  await request(app).post(`/wishlist/${id}`).set("Cookie", first).expect(201);
  await request(app).post(`/wishlist/${id}`).set("Cookie", first).expect(409);
  const wishlist = await request(app)
    .get("/wishlist")
    .set("Cookie", first)
    .expect(200);
  assert.equal(wishlist.body.wishlist[0].name, "Test Keyboard");
  assert.equal(
    (await request(app).get("/wishlist").set("Cookie", second).expect(200)).body
      .count,
    0,
  );
  await request(app).delete(`/wishlist/${id}`).set("Cookie", first).expect(200);

  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(200);
  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(200);
  await request(app).post(`/cart/${id}`).set("Cookie", first).expect(400);
  await request(app)
    .patch(`/cart/${id}`)
    .set("Cookie", first)
    .send({ quantity: 0 })
    .expect(400);
  await request(app)
    .patch(`/cart/${id}`)
    .set("Cookie", first)
    .send({ quantity: 3 })
    .expect(400);
  assert.equal(
    (await request(app).get("/cart").set("Cookie", first).expect(200)).body
      .cart[0].quantity,
    2,
  );

  const pendingPaymentId = "order_test_shopkart_01";
  nock("https://api.razorpay.com")
    .post(
      "/v1/orders",
      (body) => body.amount === 499800 && body.currency === "INR",
    )
    .reply(200, {
      id: pendingPaymentId,
      entity: "order",
      amount: 499800,
      currency: "INR",
    });
  const shippingAddress = {
    fullName: "Aarav Sharma",
    phone: "9876543210",
    addressLine1: "22 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  };
  const payment = await request(app)
    .post("/orders/create-payment-order")
    .set("Cookie", first)
    .send({ shippingAddress, totalAmount: 1 })
    .expect(201);
  assert.equal(payment.body.amount, 499800);
  const orderId = payment.body.shopKartOrderId;
  assert.equal((await Order.findById(orderId)).totalAmount, 4998);
  assert.equal(
    (await request(app).get("/cart").set("Cookie", first).expect(200)).body.cart
      .length,
    1,
  );
  await request(app)
    .post("/orders/verify-payment")
    .set("Cookie", first)
    .send({
      shopKartOrderId: orderId,
      razorpay_order_id: pendingPaymentId,
      razorpay_payment_id: "pay_test_01",
      razorpay_signature: "a".repeat(64),
    })
    .expect(400);
  assert.equal((await Order.findById(orderId)).paymentStatus, "PENDING");
  const signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${pendingPaymentId}|pay_test_01`)
    .digest("hex");
  await request(app)
    .post("/orders/verify-payment")
    .set("Cookie", first)
    .send({
      shopKartOrderId: orderId,
      razorpay_order_id: pendingPaymentId,
      razorpay_payment_id: "pay_test_01",
      razorpay_signature: signature,
    })
    .expect(200);
  assert.equal(
    (await request(app).get("/cart").set("Cookie", first).expect(200)).body.cart
      .length,
    0,
  );
  assert.equal((await Product.findById(id)).stock, 0);
  await request(app)
    .post("/orders/verify-payment")
    .set("Cookie", first)
    .send({
      shopKartOrderId: orderId,
      razorpay_order_id: pendingPaymentId,
      razorpay_payment_id: "pay_test_01",
      razorpay_signature: signature,
    })
    .expect(200);
  assert.equal((await Product.findById(id)).stock, 0);
  assert.equal(
    (
      await request(app)
        .get(`/orders/${orderId}`)
        .set("Cookie", first)
        .expect(200)
    ).body.order.status,
    "PLACED",
  );
  await request(app)
    .get(`/orders/${orderId}`)
    .set("Cookie", second)
    .expect(404);
  assert.equal(
    (await request(app).get("/orders").set("Cookie", second).expect(200)).body
      .orders.length,
    0,
  );
  assert.equal(nock.pendingMocks().length, 0);
});

test("registration normalizes email and rejects invalid input; catalog writes are closed", async () => {
  await request(app)
    .post("/customers/register")
    .send({
      fullName: "Test User",
      email: "Case@Example.com",
      password: "password123",
      phone: "9876543210",
    })
    .expect(201);
  await request(app)
    .post("/customers/login")
    .send({ email: " CASE@example.com ", password: "password123" })
    .expect(200);
  await request(app)
    .post("/customers/register")
    .send({
      fullName: "Test User",
      email: "case@example.com",
      password: "password123",
      phone: "9876543210",
    })
    .expect(409);
  for (const body of [
    { email: {} },
    { password: "tiny" },
    { phone: "123" },
    { email: "broken" },
  ]) {
    await request(app)
      .post("/customers/register")
      .send({
        fullName: "Test User",
        email: "bad@example.com",
        password: "password123",
        phone: "9876543210",
        ...body,
      })
      .expect(400);
  }
  await request(app)
    .post("/products")
    .send({ name: "Unauthorized product" })
    .expect(404);
  await request(app)
    .post("/customers/login")
    .set("Origin", "https://untrusted.example")
    .send({ email: "case@example.com", password: "password123" })
    .expect(403);
  await request(app).get("/health").expect(200);
});

test("COD persists an order, calculates totals, reduces stock and isolates ownership", async () => {
  const cookie = await login("cod@example.com");
  const product = await Product.create({
    name: "COD lamp",
    description: "Test lamp",
    price: 999.95,
    category: "Home",
    image: "https://example.com/lamp.jpg",
    stock: 3,
  });
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", cookie)
    .expect(200);
  const address = {
    fullName: "Test User",
    phone: "9876543210",
    addressLine1: "12 Test Street",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
  };
  await request(app)
    .post("/orders/cash-on-delivery")
    .set("Cookie", cookie)
    .send({ shippingAddress: { ...address, pincode: "123" } })
    .expect(400);
  const results = await Promise.all(
    [1, 2].map(() =>
      request(app)
        .post("/orders/cash-on-delivery")
        .set("Cookie", cookie)
        .send({ shippingAddress: address, totalAmount: 1 }),
    ),
  );
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 400]);
  const order = results.find((result) => result.status === 201).body.order;
  assert.equal(order.totalAmount, 999.95);
  assert.equal(order.paymentMethod, "COD");
  assert.equal(order.paymentStatus, "PENDING");
  assert.equal(order.status, "PLACED");
  assert.equal((await Product.findById(product._id)).stock, 2);
  assert.equal(
    (await request(app).get("/cart").set("Cookie", cookie)).body.cart.length,
    0,
  );
  assert.equal(
    (await request(app).get(`/orders/${order._id}`).set("Cookie", cookie)).body
      .order.items[0].name,
    "COD lamp",
  );
});

test("competing orders cannot oversell the last unit", async () => {
  const first = await login("stock-first@example.com");
  const second = await login("stock-second@example.com");
  const product = await Product.create({
    name: "Last unit",
    description: "Scarce test product",
    price: 100,
    category: "Books",
    image: "https://example.com/book.jpg",
    stock: 1,
  });
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", first)
    .expect(200);
  await request(app)
    .post(`/cart/${product._id}`)
    .set("Cookie", second)
    .expect(200);
  const address = {
    fullName: "Test User",
    phone: "9876543210",
    addressLine1: "12 Test Street",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
  };
  const results = await Promise.all(
    [first, second].map((cookie) =>
      request(app)
        .post("/orders/cash-on-delivery")
        .set("Cookie", cookie)
        .send({ shippingAddress: address }),
    ),
  );
  assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
  assert.equal((await Product.findById(product._id)).stock, 0);
  assert.equal(await Order.countDocuments({ "items.product": product._id }), 1);
  const loser = results[0].status === 409 ? first : second;
  assert.equal(
    (await request(app).get("/cart").set("Cookie", loser)).body.cart.length,
    1,
  );
});

test("literal search, category filtering and malformed requests return useful responses", async () => {
  assert.equal((await request(app).get("/products?search=%5B")).status, 200);
  const response = await request(app)
    .get("/products?category=Books")
    .expect(200);
  assert.ok(
    response.body.products.every((product) => product.category === "Books"),
  );
  await request(app).get("/products/not-an-id").expect(400);
  await request(app)
    .post("/customers/login")
    .set("Content-Type", "application/json")
    .send("{bad")
    .expect(400);
  await request(app).get("/cart").expect(401);
});

test('payment rejects malformed hex signatures and preserves later cart additions', async () => {
  const cookie = await login('payment-cart@example.com');
  const product = await Product.create({ name: 'Payment snapshot product', description: 'Test', price: 1250, category: 'Home', image: 'https://example.com/item.jpg', stock: 5 });
  const other = await Product.create({ name: 'Later cart addition', description: 'Test', price: 300, category: 'Books', image: 'https://example.com/other.jpg', stock: 5 });
  await request(app).post(`/cart/${product._id}`).set('Cookie', cookie).expect(200);
  nock('https://api.razorpay.com').post('/v1/orders').reply(200, { id: 'order_preserve_cart', amount: 125000, currency: 'INR' });
  const shippingAddress = { fullName: 'Test User', phone: '9876543210', addressLine1: '12 Test Street', city: 'Delhi', state: 'Delhi', pincode: '110001' };
  const payment = await request(app).post('/orders/create-payment-order').set('Cookie', cookie).send({ shippingAddress }).expect(201);
  await request(app).post(`/cart/${product._id}`).set('Cookie', cookie).expect(200);
  await request(app).post(`/cart/${other._id}`).set('Cookie', cookie).expect(200);
  const signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update('order_preserve_cart|pay_preserve_cart').digest('hex');
  const payload = { shopKartOrderId: payment.body.shopKartOrderId, razorpay_order_id: 'order_preserve_cart', razorpay_payment_id: 'pay_preserve_cart' };
  await request(app).post('/orders/verify-payment').set('Cookie', cookie).send({ ...payload, razorpay_signature: signature + 'z' }).expect(400);
  await request(app).post('/orders/verify-payment').set('Cookie', cookie).send({ ...payload, razorpay_signature: signature }).expect(200);
  const cart = (await request(app).get('/cart').set('Cookie', cookie)).body.cart;
  assert.equal(cart.length, 2);
  assert.equal(cart.find(line => line.product._id === String(product._id)).quantity, 1);
  assert.equal(cart.find(line => line.product._id === String(other._id)).quantity, 1);
  assert.equal((await Product.findById(product._id)).stock, 4);
  assert.equal((await Product.findById(other._id)).stock, 5);
});
