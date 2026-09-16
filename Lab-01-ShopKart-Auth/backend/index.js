require("dotenv").config({ quiet: true });
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customer.routes");

const app = express();

// The browser client runs on its own origin (Vite's dev server), so the
// browser treats every request to this API as cross-origin and will not send
// the auth cookie unless it is told to.
//
// `credentials: true` is the half that permits the cookie, and it cannot be
// used with a wildcard origin - the browser rejects `Access-Control-Allow-Origin: *`
// on any credentialed request. So the client origin is named explicitly, and
// comes from the environment rather than being hard-coded.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed", error.message);
  });
