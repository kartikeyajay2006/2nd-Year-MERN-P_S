# Lab 05 — ShopKart Shopping Cart

Lab 05 extends the [connected ShopKart app](../Lab-03-ShopKart-Product-Discovery/README.md).
Cart lines store a Product reference and quantity on the authenticated
Customer. React Context keeps cart state in sync across cards, the cart page
and the navbar.

## Implemented

- Protected `POST /cart/:productId`, `GET /cart`, `PATCH /cart/:productId`
  and `DELETE /cart/:productId` APIs.
- Re-adding a product increments quantity. Quantity is limited by current
  Product stock; invalid and missing items return useful errors.
- Add-to-cart buttons on the catalog, wishlist and product details.
- `/cart` with quantity controls, removal, calculated subtotal and checkout
  navigation.
- Global cart count, reload after sign-in and refresh, plus loading, empty
  and error states.

Source: [Customer model](../Lab-03-ShopKart-Product-Discovery/backend/models/customer.model.js),
[cart controller](../Lab-03-ShopKart-Product-Discovery/backend/controllers/cart.controller.js),
[Cart Context](../Lab-03-ShopKart-Product-Discovery/frontend/src/context/CartContext.jsx),
[cart page](../Lab-03-ShopKart-Product-Discovery/frontend/src/pages/Cart.jsx).

Run and test from the [app README](../Lab-03-ShopKart-Product-Discovery/README.md).
