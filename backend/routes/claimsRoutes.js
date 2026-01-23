const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const router = express.Router();

// ----------------- MONGODB CLAIM SCHEMA -----------------
const claimSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  policyType: { type: String, required: true },
  claimType: { type: String, required: true },
  claimAmount: { type: Number, required: true },
  incidentDate: { type: Date, required: true },
  description: { type: String, required: true },
  documents: { type: Array, default: [] },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

const Claim = mongoose.model("Claim", claimSchema);

// ----------------- FILE UPLOAD -----------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// ----------------- CREATE CLAIM -----------------
router.post("/create", upload.array("documents"), async (req, res) => {
  try {
    const newClaim = new Claim({
      userEmail: req.body.userEmail,
      userName: req.body.userName,
      policyType: req.body.policyType,
      claimType: req.body.claimType,
      claimAmount: req.body.claimAmount,
      incidentDate: req.body.incidentDate,
      description: req.body.description,
      documents: req.files || [],
    });

    await newClaim.save();
    res.json({ message: "Claim submitted", claimId: newClaim._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting claim" });
  }
});

// ----------------- ADMIN: GET ALL CLAIMS -----------------
router.get("/", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claims" });
  }
});

// ----------------- ADMIN: UPDATE CLAIM STATUS -----------------
router.post("/update", async (req, res) => {
  try {
    const { id, status } = req.body;
    const claim = await Claim.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    res.json({ message: "Claim status updated", claim });
  } catch (err) {
    res.status(500).json({ message: "Error updating claim status" });
  }
});

// ----------------- USER: GET THEIR CLAIMS -----------------
router.get("/user/:email", async (req, res) => {
  try {
    const userClaims = await Claim.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(userClaims);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user claims" });
  }
});

module.exports = router;
