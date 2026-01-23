const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// ---------------------
// CLAIM SCHEMA
// ---------------------
const claimSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: String,
  policyType: String,
  claimType: String,
  claimAmount: { type: Number, required: true },
  incidentDate: String,
  description: String,
  documents: [String],
  status: { type: String, default: "Submitted" },
  fraudScore: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

const Claim = mongoose.model("Claim", claimSchema);

// ---------------------
// EMAIL SETUP
// ---------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com",
    pass: "YOUR_16_CHAR_APP_PASSWORD",
  },
});

// ---------------------
// CREATE CLAIM
// ---------------------
router.post("/create", async (req, res) => {
  try {
    const newClaim = new Claim(req.body);
    const savedClaim = await newClaim.save();
    res.json({ message: "Claim submitted", claim: savedClaim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit claim" });
  }
});

// ---------------------
// GET ALL CLAIMS (Admin)
// ---------------------
router.get("/", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch claims" });
  }
});

// ---------------------
// UPDATE CLAIM STATUS (Admin + Notify User)
// ---------------------
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Claim not found" });

    // ---------------------
    // Send email to user
    // ---------------------
    await transporter.sendMail({
      from: `"Insurance Team" <your-email@gmail.com>`,
      to: updated.userEmail,
      subject: `Your claim has been ${status}`,
      text: `Hello,\n\nYour claim for policy "${updated.policyType}" has been ${status}.\n\nAmount: ₹${updated.claimAmount}\nStatus: ${status}\n\nThank you.`
    });

    res.json({ message: "Claim status updated", claim: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update claim" });
  }
});

// ---------------------
// GET USER CLAIMS
// ---------------------
router.get("/user/:email", async (req, res) => {
  try {
    const userClaims = await Claim.find({ userEmail: req.params.email });
    res.json(userClaims);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user claims" });
  }
});

module.exports = router;
