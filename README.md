# 2nd-Year-MERN-P_S

Engineering Lab submissions — Backend Engineering (MERN Stack).

Each lab lives in its own folder.

| Lab | Topic | Folder |
|-----|-------|--------|
| Lab 01 | ShopKart — Customer Authentication Service | [`Lab-01-ShopKart-Auth`](./Lab-01-ShopKart-Auth) |

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
