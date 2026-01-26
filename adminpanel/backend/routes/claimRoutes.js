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
  incidentDate: String, // or Date type if you want
  description: String,
  documents: [String],
  status: { type: String, default: "Submitted" },
  fraudScore: { type: Number, default: 20 },
  createdAt: { type: Date, default: Date.now }
});

const Claim = mongoose.model("Claim", claimSchema);

// ---------------------
// EMAIL TRANSPORTER
// ---------------------
// **Replace the old transporter with this**
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com",
    pass: "YOUR_16_CHAR_APP_PASSWORD",
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certificate
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
// ---------------------
// UPDATE CLAIM STATUS
// ---------------------
router.put("/:id", async (req, res) => {
  console.log("PUT /claims hit", req.params.id, req.body);

  try {
    const { status } = req.body;

    const updated = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Try sending email but DO NOT fail API
    try {
      await transporter.sendMail({
        from: `"Insurance Team" <your-email@gmail.com>`,
        to: updated.userEmail,
        subject: `Your claim has been ${status}`,
        text: `Hello ${updated.userName},

Your claim for policy "${updated.policyType}" has been ${status}.

Amount: ₹${updated.claimAmount}

Thank you.`,
      });
    } catch (emailErr) {
      console.error("EMAIL FAILED (IGNORED):", emailErr.message);
    }

    // ✅ ALWAYS return success
    res.json({
      message: "Claim status updated successfully",
      claim: updated,
    });

  } catch (err) {
    console.error("UPDATE CLAIM ERROR:", err);
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
