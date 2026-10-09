# Lab 06 — ShopKart checkout and orders

The [connected app](../Lab-03-ShopKart-Product-Discovery/README.md) supports a complete **cash-on-delivery** order journey without credentials, plus **Razorpay Test Mode** when configured with your own backend test keys.

- Protected `/checkout` validates shipping fields, Indian mobile numbers and six-digit pincodes.
- `POST /orders/cash-on-delivery` calculates the total from current database prices and atomically places the order, reduces stock and consumes purchased cart quantities.
- `POST /orders/create-payment-order` saves a purchase snapshot and creates a Razorpay test order. Missing credentials produce a useful error; COD remains available.
- `POST /orders/verify-payment` validates the stored Razorpay order ID and HMAC signature, then transactionally marks the order paid and updates inventory/cart. Repeated verification is idempotent.
- `/orders` and `/orders/:id` show actual saved status, item snapshots, shipping details and payment method. Reads enforce customer ownership. COD orders remain payment-pending, with their total due on delivery.
- Order confirmation persists on refresh. New cart additions made while Razorpay is open are preserved. Concurrent COD checkouts cannot oversell stock.

Order transactions require a MongoDB replica set. The root `npm run dev` starts one automatically. Fulfillment automation, live-money payments and refunds are outside this assignment; see the [review](../docs/PROJECT_REVIEW.md).

Sources: [order controller](../Lab-03-ShopKart-Product-Discovery/backend/controllers/order.controller.js), [transaction helpers](../Lab-03-ShopKart-Product-Discovery/backend/utils/order.js), [checkout](../Lab-03-ShopKart-Product-Discovery/frontend/src/pages/Checkout.jsx).

Setup and verification: [root README](../README.md).
