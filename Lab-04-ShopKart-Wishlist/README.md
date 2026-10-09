# Lab 04 — ShopKart Wishlist

Lab 04 extends the [connected ShopKart app](../Lab-03-ShopKart-Product-Discovery/README.md).
The wishlist stores Product ObjectId references on the authenticated
Customer. A shared React context mirrors the signed-in customer’s saved IDs
so catalog hearts and wishlist actions stay consistent.

## Implemented

- Protected `POST /wishlist/:productId`, `GET /wishlist` and
  `DELETE /wishlist/:productId` APIs, including invalid ID, missing product,
  duplicate and absent-item responses.
- Populated products returned only for the signed-in customer.
- Toggle hearts on product cards and product details, with add/remove, busy,
  pressed state and success/error notifications.
- `/wishlist` with product cards, removal, loading, retry and empty states.
- Navigation from catalog to wishlist and back to product details.

Source: [Customer model](../Lab-03-ShopKart-Product-Discovery/backend/models/customer.model.js),
[wishlist controller](../Lab-03-ShopKart-Product-Discovery/backend/controllers/wishlist.controller.js),
[wishlist page](../Lab-03-ShopKart-Product-Discovery/frontend/src/pages/Wishlist.jsx).

Run and test from the [app README](../Lab-03-ShopKart-Product-Discovery/README.md).
