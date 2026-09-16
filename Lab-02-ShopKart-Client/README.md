# ShopKart Client — Labs 02 & 03

The customer-facing authentication UI for ShopKart: register, log in, see your
own details on a protected page, and log out. React + React Router + Axios,
talking to the Lab 01 backend.

No Redux, no Firebase/Clerk/Auth0 — as the brief requires.

Lab 03 adds a data-driven product catalogue. After signing in, open
`/products` to search by name, filter by category, and follow a card to the
dynamic `/products/:id` details page. Catalogue data is fetched from the Lab 01
backend; cards are never hard-coded. The listing and details pages both handle
loading and request errors, while the listing also has an empty-result state.

---

## Running it

Two processes. The backend first, because the client is useless without it.

**1. Backend (Lab 01)**

```bash
cd ../Lab-01-ShopKart-Auth/backend
npm install
cp .env.example .env        # then fill in MONGO_URI and JWT_SECRET
npm start                   # http://localhost:3000
```

**2. Client (this folder)**

```bash
npm install
npm run dev                 # http://localhost:5173
```

If the backend runs on a port other than 3000, create a `.env` here:

```env
VITE_API_URL=http://localhost:4000
```

Then open <http://localhost:5173/register>.

---

## Folder structure

```
src/
├── pages/
│   ├── Login.jsx           Task 2 — sign in, cookie is set by the server
│   ├── Register.jsx        Task 1 — create an account
│   ├── Home.jsx            Task 3 — protected, shows /customers/me
│   ├── Products.jsx        Lab 03 — fetched, searchable product catalogue
│   └── ProductDetails.jsx  Lab 03 — one product, read from its URL ID
├── components/
│   ├── Navbar.jsx          Task 4 — logout lives here
│   ├── ProtectedRoute.jsx  the guard in front of /home
│   ├── ProductCard.jsx     Lab 03 — one dynamically rendered product
│   └── SearchBar.jsx       Lab 03 — name search and category selector
├── context/
│   └── AuthContext.jsx     who is signed in, asked of the server
├── services/
│   └── api.js              one axios instance, withCredentials: true
├── App.jsx                 routes
├── main.jsx                entry
└── styles.css
```

---

## Routes

| Route | Page | Access |
|---|---|---|
| `/register` | Registration | public |
| `/login` | Login | public |
| `/home` | Customer details | signed in only |
| `/products` | Product catalogue | signed in only |
| `/products/:id` | Product details | signed in only |
| `/` and anything else | redirect | — |

---

## What each task does

**Task 1 — Register.** Four controlled fields. Validated in the browser so
mistakes are caught immediately, and again on the server because a server
cannot trust a client. On success it redirects to `/login`, since registering
does not sign you in — the backend issues no cookie there.

**Task 2 — Login.** Posts the credentials with `withCredentials: true`. The
server replies with `Set-Cookie: token=…; HttpOnly`, the browser stores it, and
this app never sees it. A wrong email or a wrong password both produce
"Invalid credentials" — the backend deliberately does not say which, because
saying so would reveal which emails are registered.

**Task 3 — Protected Home.** `ProtectedRoute` asks `GET /customers/me`. If the
cookie is valid the customer is rendered; if not, it redirects to `/login`.
While the first answer is still in flight it shows "Checking your session…" —
without that, a refresh would throw a signed-in customer out to the login page,
because "not signed in" and "not asked yet" look identical.

**Task 4 — Logout.** Posts to `/customers/logout` so the *server* clears the
cookie, then redirects. Clearing state locally would not work: the cookie is
HttpOnly, so this app cannot delete it, and the next reload would sign you
straight back in.

---

## One change to Lab 01

`Lab-01-ShopKart-Auth/backend/index.js` gained CORS:

```js
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
```

It is required, not cosmetic. The client and the API are different origins
(different ports), so without it the browser blocks every request. And
`credentials: true` cannot be combined with a wildcard origin — the browser
refuses `Access-Control-Allow-Origin: *` on any request carrying cookies — so
the client origin is named explicitly and read from the environment.

---

## Lab 03 API contract

| Method | Endpoint | Result |
|---|---|---|
| POST | `/products` | Creates a validated product |
| GET | `/products` | Lists products; accepts `search` and `category` |
| GET | `/products/:id` | Returns one product by MongoDB ID |

For example, entering `phone` and selecting Electronics requests
`/products?search=phone&category=Electronics`. The backend builds one MongoDB
query from those values, so the browser always displays the filtered API data.

---

## Viva answers

**1. Why `withCredentials: true`?**
By default the browser does not attach cookies to cross-origin requests. The
session lives in a cookie, so without this the API sees an anonymous request
and answers 401. The server must also send `Access-Control-Allow-Credentials:
true`; one half without the other does nothing.

**2. Why can't JavaScript read HttpOnly cookies?**
Because the browser refuses to expose them to `document.cookie`. That is the
point: if a cross-site scripting flaw ever runs a script on the page, it still
cannot read the session token and send it elsewhere. The cost is that the app
cannot inspect the cookie either — which is why the session is checked by
asking the server rather than by reading it.

**3. Why is `/home` a protected route?**
It shows one customer's personal data. The real protection is the server's —
`/customers/me` answers 401 without a valid cookie — and the route guard exists
so an unauthenticated visitor gets sent to the login page instead of an empty
or broken screen.

**4. Why fetch `/customers/me` instead of storing the user after login?**
A stored copy is a claim the client makes about itself, and it goes stale: the
session can expire, or be ended in another tab, while the copy still says
"signed in". The cookie is the session and only the server can read it, so the
server is the only thing that can answer who you are.

**5. Authentication vs authorisation.**
Authentication is *who are you* — the login, and the cookie that carries the
answer. Authorisation is *what may you do* — checked per request. Here
`protect` authenticates on every protected route; a real ShopKart would then
authorise separately, so that a customer could see their own orders but not
somebody else's.
