# Lab 06 — ShopKart Checkout & Orders

Lab 06 completes the [connected ShopKart app](../Lab-03-ShopKart-Product-Discovery/README.md)
with Razorpay **Test Mode** Standard Checkout. You must provide your own
Razorpay test key ID and secret in the backend `.env` before testing payment.

## Implemented

- `/checkout` shipping form with required fields, Indian mobile number and
  six-digit pincode validation, order summary, busy and error states.
- Protected `POST /orders/create-payment-order`: reloads cart and Products,
  checks stock, computes totals on the server, saves a pending order snapshot
  and creates a Razorpay order with an amount in paise.
- Razorpay Checkout loaded in React. Its response is sent to protected
  `POST /orders/verify-payment`; HMAC SHA256 is checked against the stored
  Razorpay order ID with the backend secret.
- Verified payment becomes `PAID` / `PLACED` and clears the backend and
  frontend cart. A failed or cancelled payment leaves the cart intact.
- Protected `GET /orders` and `GET /orders/:id`, `/orders` history and an
  order detail/confirmation page. Single-order reads enforce ownership.

Source: [Order model](../Lab-03-ShopKart-Product-Discovery/backend/models/order.model.js),
[order controller](../Lab-03-ShopKart-Product-Discovery/backend/controllers/order.controller.js),
[checkout page](../Lab-03-ShopKart-Product-Discovery/frontend/src/pages/Checkout.jsx),
[orders pages](../Lab-03-ShopKart-Product-Discovery/frontend/src/pages/Orders.jsx).

Run and test from the [app README](../Lab-03-ShopKart-Product-Discovery/README.md).
