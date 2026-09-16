import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000", withCredentials: true });
export async function fetchProducts(filters = {}) { const { data } = await api.get("/products", { params: filters }); return data.products; }
export async function fetchProduct(id) { const { data } = await api.get(`/products/${id}`); return data.product; }
export async function registerCustomer(form) { return api.post("/customers/register", form); }
export async function loginCustomer(form) { return api.post("/customers/login", form); }
export async function fetchMe() { const { data } = await api.get("/customers/me"); return data; }
export async function logoutCustomer() { return api.post("/customers/logout"); }
export function errorMessage(error) { return error?.response?.data?.message || "Something went wrong while loading products."; }
