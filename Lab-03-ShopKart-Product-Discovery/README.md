# Lab 03 — ShopKart Product Catalog & Discovery

This is the complete, self-contained ShopKart application for Lab 03. It
combines the work from the first three labs into one application:

```text
Sign up / Login (Lab 01 + Lab 02)  →  Home  →  Product Discovery (Lab 03)
              backend :3000               frontend :5173
```

The `backend/` contains both customer authentication and product APIs. The
`frontend/` contains Register, Login, protected Home, Products and Product
Details routes. A customer signs in once and continues to the catalogue within
the same browser application.

## What is implemented

- Product Mongoose schema with required fields, automatic `createdAt`, a
  positive price, and non-negative stock.
- `POST /products`, `GET /products`, and `GET /products/:id` APIs.
- Case-insensitive name search and category filtering through query parameters.
- Dynamic React cards, product detail pages using URL parameters, and an
  Add-to-Cart UI placeholder.
- Loading, error, and empty-result states.

## Run the connected labs

Start only Lab 03 in two terminals:

```bash
# Terminal 1 — Lab 03 API
cd backend
npm install
cp .env.example .env  # set MONGO_URI and JWT_SECRET
npm start             # http://localhost:3000

# Terminal 2 — Lab 03 catalogue UI
cd frontend
npm install
npm run dev           # http://localhost:5173
```

The UI defaults to `http://localhost:3000`; change it with `VITE_API_URL` in
`frontend/.env` if needed. Open <http://localhost:5173/register> to create an
account, then log in and browse products.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/products` | Create a product; validation failures return `400` |
| GET | `/products` | List products |
| GET | `/products/:id` | Fetch a product; invalid IDs return `400`, missing products `404` |

Filtering examples:

```text
/products?search=keyboard
/products?category=Electronics
/products?search=keyboard&category=Electronics
```
