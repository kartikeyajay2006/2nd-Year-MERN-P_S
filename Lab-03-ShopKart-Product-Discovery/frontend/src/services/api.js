import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001" });
export async function fetchProducts(filters = {}) { const { data } = await api.get("/products", { params: filters }); return data.products; }
export async function fetchProduct(id) { const { data } = await api.get(`/products/${id}`); return data.product; }
export function errorMessage(error) { return error?.response?.data?.message || "Something went wrong while loading products."; }
