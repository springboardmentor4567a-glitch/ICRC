const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Routes
const claimRoutes = require("./routes/claimRoutes"); // Make sure path is correct

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// MONGODB CONNECTION
// =====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Adminpanel MongoDB Connected"))
  .catch(err => console.error("❌ Adminpanel MongoDB Connection Failed:", err));

// =====================
// ROUTES
// =====================
// Use claim routes for admin panel
// Admin panel will fetch all claims and update status
app.use("/api/claims", claimRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("✅ Admin Backend Running");
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Admin Server running on http://localhost:${PORT}`);
});
