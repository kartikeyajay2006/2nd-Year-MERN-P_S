import axios from "axios";
// Keep the API on the same local hostname as the page. `localhost` and
// `127.0.0.1` are different browser sites; mixing them prevents a Strict
// HttpOnly session cookie from being sent after login.
const localApiUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || localApiUrl,
  withCredentials: true,
  timeout: 15000,
});
export async function fetchProducts(filters = {}) {
  const { data } = await api.get("/products", { params: filters });
  return data.products;
}
export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data.product;
}
export async function registerCustomer(form) {
  return api.post("/customers/register", form);
}
export async function loginCustomer(form) {
  return api.post("/customers/login", form);
}
export async function fetchMe() {
  const { data } = await api.get("/customers/me");
  return data;
}
export async function logoutCustomer() {
  return api.post("/customers/logout");
}
export async function fetchWishlist() {
  const { data } = await api.get("/wishlist");
  return data.wishlist;
}
export async function addWishlist(id) {
  await api.post(`/wishlist/${id}`);
}
export async function removeWishlist(id) {
  await api.delete(`/wishlist/${id}`);
}
export async function fetchCart() {
  const { data } = await api.get("/cart");
  return data.cart;
}
export async function addCart(id) {
  const { data } = await api.post(`/cart/${id}`);
  return data.cart;
}
export async function updateCart(id, quantity) {
  const { data } = await api.patch(`/cart/${id}`, { quantity });
  return data.cart;
}
export async function removeCart(id) {
  const { data } = await api.delete(`/cart/${id}`);
  return data.cart;
}
export async function createPaymentOrder(shippingAddress) {
  const { data } = await api.post("/orders/create-payment-order", {
    shippingAddress,
  });
  return data;
}
export async function verifyPayment(payload) {
  const { data } = await api.post("/orders/verify-payment", payload);
  return data.order;
}
export async function fetchOrders() {
  const { data } = await api.get("/orders");
  return data.orders;
}
export async function fetchOrder(id) {
  const { data } = await api.get(`/orders/${id}`);
  return data.order;
}
export async function placeCodOrder(shippingAddress) {
  const { data } = await api.post("/orders/cash-on-delivery", {
    shippingAddress,
  });
  return data.order;
}
export function errorMessage(error) {
  return (
    error?.response?.data?.message ||
    (error?.code === "ECONNABORTED"
      ? "This is taking longer than expected. Please try again."
      : error?.request
        ? "We cannot reach the store. Check your connection and try again."
        : error?.message || "Something went wrong. Please try again.")
  );
}
