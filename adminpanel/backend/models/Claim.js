const express = require("express");
const router = express.Router();
const Claim = require("../Claim");

// Get all claims
router.get("/claims", async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claims" });
  }
});

// Approve or Reject a claim
router.patch("/claims/:id", async (req, res) => {
  try {
    const { status } = req.body; // status = "Approved" or "Rejected"
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ message: "Claim updated", claim });
  } catch (err) {
    res.status(500).json({ message: "Error updating claim" });
  }
});

module.exports = router;
