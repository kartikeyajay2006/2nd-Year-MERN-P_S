# ShopKart — Connected Labs 01–06

This folder is the single running ShopKart application. It combines the Labs
01–03 sign-in and product discovery app with Lab 04 wishlist, Lab 05 cart and
Lab 06 checkout and orders. All features share one account, database and
browser session.

```text
Register / Login → Browse 41 products → Wishlist → Cart → Checkout
    → Razorpay Test Mode → Payment verification → Order history
```

The [Lab 04](../Lab-04-ShopKart-Wishlist/README.md),
[Lab 05](../Lab-05-ShopKart-Shopping-Cart/README.md) and
[Lab 06](../Lab-06-ShopKart-Checkout-Orders/README.md) notes identify each lab's
routes and source files. The code lives here so the journey stays connected.

## Run locally

Use Node.js 20 or newer and a running MongoDB instance. Start the API and UI
in separate terminals:

```bash
cd Lab-03-ShopKart-Product-Discovery/backend
npm install
cp .env.example .env
# Set MONGO_URI and a long JWT_SECRET in .env.
# Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your Razorpay Test Mode keys.
npm run seed
npm start
```

```bash
cd Lab-03-ShopKart-Product-Discovery/frontend
npm install
npm run dev
```

Use `http://localhost:5173`. The API runs at `http://localhost:3000`. The
frontend accepts `VITE_API_URL` if the backend runs elsewhere. For local
MongoDB, `MONGO_URI=mongodb://127.0.0.1:27017/shopkart` works. The seed is
safe to rerun: it upserts by name and keeps user-created products.

Razorpay keys must be **test keys** (`rzp_test_...`). The key secret stays in
the backend `.env`; the frontend receives only the key ID and Razorpay order
ID. Without test keys, browsing, wishlist and cart work, and checkout shows a
clear configuration error. A real test payment also requires a Razorpay Test
Mode account and network access to Razorpay Checkout.

## Routes

| Area | UI | API |
| --- | --- | --- |
| Account | `/register`, `/login` | `/customers/register`, `/customers/login`, `/customers/me`, `/customers/logout` |
| Catalog | `/products`, `/products/:id` | `GET /products`, `GET /products/:id` |
| Wishlist | `/wishlist` | `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId` |
| Cart | `/cart` | `GET /cart`, `POST /cart/:productId`, `PATCH /cart/:productId`, `DELETE /cart/:productId` |
| Checkout | `/checkout` | `POST /orders/create-payment-order`, `POST /orders/verify-payment` |
| Orders | `/orders`, `/orders/:id` | `GET /orders`, `GET /orders/:id` |

All wishlist, cart and order APIs require the signed-in customer's HttpOnly
cookie. The server derives ownership from that session, not from a request
body. Cart and wishlist keep Product references; an Order keeps an immutable
name, price, image and quantity snapshot. Order totals and stock checks use
fresh Product data on the server. The cart clears only after a valid Razorpay
signature confirms payment.

## Verify

```bash
cd Lab-03-ShopKart-Product-Discovery/backend
npm test

cd ../frontend
npm run build
```

The backend integration test uses an in-memory MongoDB and a mocked Razorpay
Orders API. It checks wishlist isolation, cart stock limits, server-calculated
totals, invalid signatures, successful confirmation, cart clearing and order
ownership. The production frontend build verifies all pages compile.
