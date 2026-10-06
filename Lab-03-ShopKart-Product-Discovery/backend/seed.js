require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Product = require("./models/product.model");
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;

const products = [
  { name: "Wireless Mechanical Keyboard", description: "Compact hot-swappable keyboard with a wireless connection and tactile switches.", price: 4299, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", stock: 12 },
  { name: "Noise Cancelling Headphones", description: "Over-ear headphones with balanced sound and all-day battery life.", price: 6499, category: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", stock: 8 },
  { name: "Everyday Cotton T-Shirt", description: "Soft, breathable cotton t-shirt designed for comfortable daily wear.", price: 799, category: "Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", stock: 30 },
  { name: "Clean Code", description: "A practical guide to writing readable, maintainable software.", price: 699, category: "Books", image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=80", stock: 15 },
  { name: "Ceramic Table Lamp", description: "Warm, adjustable ambient lighting for a desk, bedside table, or reading corner.", price: 1899, category: "Home", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", stock: 6 },
  { name: "Studio Wireless Earbuds", description: "Pocket-sized earbuds with immersive sound and a charging case.", price: 3299, category: "Electronics", image: photo("photo-1606220588913-b3aacb4d2f46"), stock: 18 },
  { name: "Minimal Analog Watch", description: "A clean dial and comfortable strap for every day.", price: 2499, category: "Fashion", image: photo("photo-1523275335684-37898b6baf30"), stock: 14 },
  { name: "Everyday Canvas Backpack", description: "Room for your laptop, notebook and daily essentials.", price: 2199, category: "Fashion", image: photo("photo-1553062407-98eeb64c6a62"), stock: 20 },
  { name: "Portable Bluetooth Speaker", description: "Rich portable sound with a durable travel-friendly build.", price: 2999, category: "Electronics", image: photo("photo-1608043152269-423dbba4e7e1"), stock: 11 },
  { name: "Classic White Sneakers", description: "A versatile low-top silhouette with cushioned support.", price: 3499, category: "Fashion", image: photo("photo-1549298916-b41d501d3772"), stock: 16 },
  { name: "Pour-Over Coffee Set", description: "Make a balanced cup at home with this elegant brewing set.", price: 1599, category: "Home", image: photo("photo-1495474472287-4d71bcdd2085"), stock: 23 },
  { name: "The Creative Habit", description: "A thoughtful companion for building a consistent creative practice.", price: 599, category: "Books", image: photo("photo-1544947950-fa07a98d237f"), stock: 31 },
  { name: "Compact Digital Camera", description: "Capture sharp stills and memories wherever you go.", price: 18999, category: "Electronics", image: photo("photo-1516035069371-29a1b244cc32"), stock: 7 },
  { name: "Linen Cushion Cover", description: "A soft natural texture for a calmer living space.", price: 899, category: "Home", image: photo("photo-1584100936595-c0654b55a2e2"), stock: 26 },
  { name: "Travel Insulated Bottle", description: "Keeps your drinks at the right temperature on the move.", price: 1299, category: "Home", image: photo("photo-1602143407151-7111542de6e8"), stock: 34 },
  { name: "Classic Denim Jacket", description: "An easy layer with a timeless washed finish.", price: 2799, category: "Fashion", image: photo("photo-1551028719-00167b16eac5"), stock: 13 },
  { name: "Smart Fitness Watch", description: "Track activity, sleep and daily goals from your wrist.", price: 4999, category: "Electronics", image: photo("photo-1579586337278-3befd40fd17a"), stock: 10 },
  { name: "The Design of Everyday Things", description: "Explore the principles behind products that feel effortless to use.", price: 749, category: "Books", image: photo("photo-1512820790803-83ca734da794"), stock: 19 },
  { name: "Arc Desk Organizer", description: "Keep your workspace tidy with considered compartments.", price: 999, category: "Home", image: photo("photo-1497366754035-f200968a6e72"), stock: 22 },
  { name: "Leather Card Holder", description: "A slim wallet with room for your essential cards.", price: 1199, category: "Fashion", image: photo("photo-1627123424574-724758594e93"), stock: 21 },
  { name: "Wireless Charging Pad", description: "A low-profile charger for a clutter-free desk.", price: 1499, category: "Electronics", image: photo("photo-1586953208448-b95a79798f07"), stock: 17 },
  { name: "Sculptural Ceramic Vase", description: "A simple statement piece for shelves and tables.", price: 1699, category: "Home", image: photo("photo-1578500494198-246f612d3b3d"), stock: 15 },
  { name: "Relaxed Cotton Shirt", description: "Breathable cotton with an easy everyday fit.", price: 1399, category: "Fashion", image: photo("photo-1598032895397-b9472444bf93"), stock: 24 },
  { name: "Deep Work", description: "A practical guide to focused work in a distracted world.", price: 649, category: "Books", image: photo("photo-1543002588-bfa74002ed7e"), stock: 28 },
  { name: "Ergonomic Wireless Mouse", description: "Comfortable precision for long work sessions.", price: 1899, category: "Electronics", image: photo("photo-1527814050087-3793815479db"), stock: 20 },
  { name: "Soft Knit Throw", description: "Bring an extra layer of warmth to your sofa or bed.", price: 2299, category: "Home", image: photo("photo-1600210492486-724fe5c67fb0"), stock: 12 },
  { name: "Polarized Sunglasses", description: "Lightweight frames and clear vision in bright light.", price: 1799, category: "Fashion", image: photo("photo-1511499767150-a48a237f0083"), stock: 18 },
  { name: "Pocket Notebook Set", description: "Three durable notebooks for ideas on the go.", price: 499, category: "Books", image: photo("photo-1531346878377-a5be20888e57"), stock: 40 },
  { name: "Portable SSD 1TB", description: "Fast, dependable storage in a compact design.", price: 7499, category: "Electronics", image: photo("photo-1531492746076-161ca9bcad58"), stock: 9 },
  { name: "Textured Bath Towel Set", description: "Soft, absorbent towels for a considered bathroom refresh.", price: 1999, category: "Home", image: photo("photo-1631889993959-41b4e9c6e3c5"), stock: 16 },
  { name: "Crossbody Day Bag", description: "Carry the essentials hands-free in a compact silhouette.", price: 2399, category: "Fashion", image: photo("photo-1548036328-c9fa89d128fa"), stock: 14 },
  { name: "Atomic Habits", description: "Small changes, remarkable results and better daily systems.", price: 699, category: "Books", image: photo("photo-1544947950-fa07a98d237f"), stock: 35 },
  { name: "Monitor Light Bar", description: "Focused desk lighting without screen glare.", price: 3699, category: "Electronics", image: photo("photo-1497366811353-6870744d04b2"), stock: 8 },
  { name: "Stoneware Dinner Set", description: "Durable modern tableware for everyday meals.", price: 3299, category: "Home", image: photo("photo-1490312278390-ab64016e0aa9"), stock: 11 },
  { name: "Essential Running Shoes", description: "Supportive lightweight shoes made for daily miles.", price: 3999, category: "Fashion", image: photo("photo-1542291026-7eec264c27ff"), stock: 19 },
  { name: "The Psychology of Money", description: "Timeless lessons on wealth, behavior and decisions.", price: 629, category: "Books", image: photo("photo-1512820790803-83ca734da794"), stock: 30 },
  { name: "Adjustable Laptop Stand", description: "Raise your screen for a more comfortable workspace.", price: 2199, category: "Electronics", image: photo("photo-1498050108023-c5249f4df085"), stock: 22 },
  { name: "Indoor Planter Duo", description: "Two ceramic planters to bring greenery indoors.", price: 1299, category: "Home", image: photo("photo-1416879595882-3373a0480b5b"), stock: 25 },
  { name: "Ribbed Everyday Socks", description: "Comfortable cotton blend socks in a versatile set.", price: 599, category: "Fashion", image: photo("photo-1586350977771-b3b0abd50c82"), stock: 42 },
  { name: "Thinking, Fast and Slow", description: "A compelling look at how we think and decide.", price: 799, category: "Books", image: photo("photo-1481627834876-b7833e8f5570"), stock: 23 },
  { name: "Compact USB-C Hub", description: "Connect displays and everyday accessories from one port.", price: 2499, category: "Electronics", image: photo("photo-1518770660439-4636190af475"), stock: 18 },
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error("Missing required environment variable: MONGO_URI");
  await mongoose.connect(process.env.MONGO_URI);
  await Product.bulkWrite(
    products.map((product) => ({
      updateOne: { filter: { name: product.name }, update: { $set: product }, upsert: true },
    }))
  );
  console.log(`Seeded ${products.length} products.`);
}

seed()
  .catch((error) => {
    console.error("Unable to seed products:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
