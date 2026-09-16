import axios from "axios";
// Keep the API on the same local hostname as the page. `localhost` and
// `127.0.0.1` are different browser sites; mixing them prevents a Strict
// HttpOnly session cookie from being sent after login.
const localApiUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || localApiUrl, withCredentials: true });
export async function fetchProducts(filters = {}) { const { data } = await api.get("/products", { params: filters }); return data.products; }
export async function fetchProduct(id) { const { data } = await api.get(`/products/${id}`); return data.product; }
export async function registerCustomer(form) { return api.post("/customers/register", form); }
export async function loginCustomer(form) { return api.post("/customers/login", form); }
export async function fetchMe() { const { data } = await api.get("/customers/me"); return data; }
export async function logoutCustomer() { return api.post("/customers/logout"); }
export function errorMessage(error) { return error?.response?.data?.message || "Something went wrong while loading products."; }
