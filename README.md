# 2nd-Year-MERN-P_S

Engineering Lab submissions — Backend Engineering (MERN Stack).

Each lab lives in its own folder.

| Lab | Topic | Folder |
|-----|-------|--------|
| Lab 01 | ShopKart — Customer Authentication Service | [`Lab-01-ShopKart-Auth`](./Lab-01-ShopKart-Auth) |
| Lab 02 | ShopKart — Customer Authentication UI (React client) | [`Lab-02-ShopKart-Client`](./Lab-02-ShopKart-Client) |
| Lab 03 | ShopKart — Product Catalog & Discovery | [`Lab-03-ShopKart-Product-Discovery`](./Lab-03-ShopKart-Product-Discovery) |

---

## Lab 01 — ShopKart Customer Authentication Service

Authentication backend for ShopKart built with Node.js, Express, MongoDB,
Mongoose, bcrypt, jsonwebtoken and cookie-parser, following MVC architecture.

### Run

```bash
cd Lab-01-ShopKart-Auth/backend
npm install
# create a .env file (see .env.example)
npm start
```

### .env

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### API Endpoints

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/customers/register` | No | Register a new customer |
| POST | `/customers/login` | No | Login, sets JWT in an HttpOnly cookie |
| GET | `/customers/me` | Yes | Get the logged-in customer's profile |
| POST | `/customers/logout` | Yes | Clear the authentication cookie |
| PATCH | `/customers/change-password` | Yes | Change password (Bonus) |

---

## Lab 02 — ShopKart Customer Authentication UI

The React client for the Lab 01 API: register, login, a protected home page
that shows the signed-in customer, and logout. Built with React, React Router
and Axios, using the HttpOnly session cookie the backend issues.

### Run

Start the Lab 01 backend first, then:

```bash
cd Lab-02-ShopKart-Client
npm install
npm run dev
```

The client runs on <http://localhost:5173> and expects the API on
`http://localhost:3000` unless `VITE_API_URL` says otherwise.

Full notes, including the CORS change Lab 01 needed and answers to the viva
questions, are in [`Lab-02-ShopKart-Client/README.md`](./Lab-02-ShopKart-Client/README.md).

---

## Lab 03 — ShopKart Product Catalog & Discovery

Lab 03 is a self-contained combined ShopKart application: the Lab 01 customer
authentication API, Lab 02 register/login UI and Lab 03 searchable product
catalogue run together from its own backend and frontend folders. See the
[Lab 03 README](./Lab-03-ShopKart-Product-Discovery/README.md) for the run
instructions and API reference.
