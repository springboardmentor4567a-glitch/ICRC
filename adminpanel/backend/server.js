const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// =====================
// ROUTES
// =====================
const claimRoutes = require("./routes/claimRoutes");
const adminAuthRoutes = require("./routes/adminAuth"); // ✅ ADD THIS

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

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

// 🔐 Admin authentication routes
// login → /api/admin/login
// register → /api/admin/register
app.use("/api/admin", adminAuthRoutes); // ✅ ADD THIS

// 📄 Claim management routes
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
