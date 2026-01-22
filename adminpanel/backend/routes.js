const express = require("express");
const bcrypt = require("bcryptjs");
const admins = require("./data");

const router = express.Router();

/* ======================
   ADMIN SIGNUP
====================== */
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const adminExists = admins.find(a => a.email === email);
  if (adminExists) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = {
    id: admins.length + 1,
    name,
    email,
    password: hashedPassword
  };

  admins.push(newAdmin);

  res.json({ message: "Admin registered successfully" });
});

/* ======================
   ADMIN LOGIN
====================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = admins.find(a => a.email === email);
  if (!admin) {
    return res.status(401).json({ message: "Invalid email" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid password" });
  }

  res.json({
    message: "Admin login successful",
    token: "admin-auth-token",
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email
    }
  });
});

/* ======================
   DASHBOARD DATA (STATIC)
====================== */
router.get("/dashboard", (req, res) => {
  res.json({
    totalClaimValue: 554223,
    totalClaims: 8,
    pendingClaims: 6,
    totalUsers: 0,
    totalPolicies: 9
  });
});
router.get("/", (req, res) => {
  res.json(claims);
});
router.post("/update", (req, res) => {
  const { id, status } = req.body;

  const claim = claims.find(c => c.id === id);
  if (!claim) {
    return res.status(404).json({ message: "Claim not found" });
  }

  claim.status = status;
  res.json({ message: "Claim status updated", claim });
});
router.get("/user/:email", (req, res) => {
  const userClaims = claims.filter(
    c => c.userEmail === req.params.email
  );
  res.json(userClaims);
});

module.exports = router;
