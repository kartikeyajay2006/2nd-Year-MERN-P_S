# Lab 03 — ShopKart Product Catalog & Discovery

This is a separate full-stack Lab 03 submission, connected to the ShopKart
journey built in the earlier labs:

```text
Lab 01 authentication API  →  Lab 02 login UI  →  Lab 03 product discovery
       :3000                       :5173                 :3001 / :5174
```

Lab 02 remains the customer entry point. Its home page leads into the product
experience; this Lab 03 app keeps the catalogue API and catalogue UI isolated
in their own folders. Both backend services use the same MongoDB connection,
so authentication and product data stay in one ShopKart database.

## What is implemented

- Product Mongoose schema with required fields, automatic `createdAt`, a
  positive price, and non-negative stock.
- `POST /products`, `GET /products`, and `GET /products/:id` APIs.
- Case-insensitive name search and category filtering through query parameters.
- Dynamic React cards, product detail pages using URL parameters, and an
  Add-to-Cart UI placeholder.
- Loading, error, and empty-result states.

## Run the connected labs

First run Lab 01 and Lab 02 as usual if you want to use the complete login →
home → catalogue journey. Then start Lab 03 in two terminals.

```bash
# Terminal 1 — Lab 03 API
cd backend
npm install
cp .env.example .env  # add the same MongoDB connection string used in Lab 01
npm start             # http://localhost:3001

# Terminal 2 — Lab 03 catalogue UI
cd frontend
npm install
npm run dev           # http://localhost:5174
```

The UI defaults to `http://localhost:3001`; change it with
`VITE_API_URL` in `frontend/.env` if needed. The **Back to Lab 02** link goes
to the Lab 02 home page at `http://localhost:5173/home`.

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
