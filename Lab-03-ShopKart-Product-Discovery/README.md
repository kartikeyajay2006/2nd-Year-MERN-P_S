# ShopKart — connected Labs 01–06

This folder contains the final runnable React/Express/MongoDB application. Start from the repository root:

```bash
npm run setup
npm run dev
```

Open http://127.0.0.1:5173. The runner starts a persistent MongoDB replica set on port 27018, the API on port 3000, and Vite on port 5173. Register an account, explore the collection, save a wishlist, build a bag and complete a **cash-on-delivery** order without any API keys.

**Live demo:** https://shopkart-black-one.vercel.app (Vercel + MongoDB Atlas).

Razorpay **Test Mode** is also supported with your own optional backend credentials. Never commit `.env` or place server secrets in frontend variables.

The [root README](../README.md) contains the complete feature list, screenshots, architecture, environment settings, routes, troubleshooting and deployment notes. The [project review](../docs/PROJECT_REVIEW.md) explains findings and remaining boundaries.

## Routes

| Area     | UI                                    | API                                                                                                 |
| -------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Account  | `/register`, `/login`                 | `/customers/register`, `/customers/login`, `/customers/me`, `/customers/logout`                     |
| Catalog  | `/home`, `/products`, `/products/:id` | `GET /products`, `GET /products/:id`                                                                |
| Wishlist | `/wishlist`                           | `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId`                         |
| Cart     | `/cart`                               | `GET /cart`, `POST /cart/:productId`, `PATCH /cart/:productId`, `DELETE /cart/:productId`           |
| Checkout | `/checkout`                           | `POST /orders/cash-on-delivery`, `POST /orders/create-payment-order`, `POST /orders/verify-payment` |
| Orders   | `/orders`, `/orders/:id`              | `GET /orders`, `GET /orders/:id`                                                                    |

Catalog pages are public. Customer pages and APIs require the HttpOnly session cookie. Order placement uses transactions and needs a replica set or Atlas; use the root runner for a ready local setup. Order snapshots preserve purchase-time prices and names. Stock is reduced once, and only purchased quantities are consumed from the cart.

## Verify

From the repository root:

```bash
npm test
npm run build
```

With the app running, from `frontend/`:

```bash
npm run test:e2e
```

See [Lab 04](../Lab-04-ShopKart-Wishlist/README.md), [Lab 05](../Lab-05-ShopKart-Shopping-Cart/README.md) and [Lab 06](../Lab-06-ShopKart-Checkout-Orders/README.md) for the corresponding lab scope.
