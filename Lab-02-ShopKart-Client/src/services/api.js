import axios from "axios";

/**
 * One axios instance for the whole app.
 *
 * `withCredentials: true` is the important line. The browser will not attach
 * a cookie to a cross-origin request unless it is asked to, and the client
 * (Vite, on :5173) and the API (Express, on :3000) are different origins. The
 * server has the matching half — `cors({ credentials: true })` with this
 * origin named explicitly — and both halves are required.
 *
 * Nothing here reads the auth cookie, because nothing can: it is HttpOnly, so
 * it is invisible to JavaScript by design. The browser sends it, the server
 * reads it, and this app never sees it. That is what stops a cross-site
 * script from stealing a session.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Turn any failure into a sentence worth showing someone.
 *
 * The API answers with `{ success: false, message }`, but a request can also
 * fail before it ever arrives — the server is not running, the network is
 * gone — and in that case there is no response to read a message out of. A
 * page showing "undefined" is what happens when that case is forgotten.
 */
export function messageFrom(error, fallback = "Something went wrong") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the server. Is the backend running?";
  }
  return fallback;
}

/** POST /customers/register */
export function registerCustomer({ fullName, email, password, phone }) {
  return api.post("/customers/register", { fullName, email, password, phone });
}

/** POST /customers/login — the response sets the HttpOnly cookie. */
export function loginCustomer({ email, password }) {
  return api.post("/customers/login", { email, password });
}

/**
 * GET /customers/me — who the cookie says you are.
 *
 * This endpoint returns the customer document directly rather than wrapping it
 * in `{ customer: ... }` the way register and login do, so it is unwrapped
 * here instead of at three call sites.
 */
export async function fetchMe() {
  const { data } = await api.get("/customers/me");
  return data;
}

/** POST /customers/logout — clears the cookie server-side. */
export function logoutCustomer() {
  return api.post("/customers/logout");
}

/** GET /products, optionally narrowed by the catalogue's query parameters. */
export async function fetchProducts({ search = "", category = "" } = {}) {
  const params = {};
  if (search.trim()) params.search = search.trim();
  if (category) params.category = category;
  const { data } = await api.get("/products", { params });
  return data.products;
}

/** GET /products/:id */
export async function fetchProduct(productId) {
  const { data } = await api.get(`/products/${productId}`);
  return data.product;
}

export default api;
