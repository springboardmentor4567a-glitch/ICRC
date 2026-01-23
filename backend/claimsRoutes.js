const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const Claim = require("./models/Claim"); // MongoDB Claim model
const authenticateToken = require("./auth"); // JWT middleware

// ✅ File upload setup
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// =====================
// USER FILES A CLAIM
// =====================
router.post("/", authenticateToken, upload.array("documents"), async (req, res) => {
  try {
    const { policyType, claimType, claimAmount, incidentDate, description } = req.body;
    const email = req.user.email; // from JWT
    const files = req.files ? req.files.map(f => f.filename) : [];

    const newClaim = new Claim({
      userEmail: email,
      policyType,
      claimType,
      claimAmount,
      incidentDate,
      description,
      documents: files,
      status: "Submitted",
    });

    const savedClaim = await newClaim.save();

    res.json({ message: "Claim submitted successfully", claimId: savedClaim._id });
  } catch (err) {
    console.error("❌ CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to submit claim", error: err.message });
  }
});
// GET USER CLAIMS
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const claims = await Claim.find({ userEmail: req.user.email });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});
module.exports = router;
