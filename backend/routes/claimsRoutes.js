const express = require("express");
const multer = require("multer");
const claims = []; // in-memory storage

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // for document uploads

// THIS IS WHERE YOU ADD THE POST /create
router.post("/create", upload.array("documents"), (req, res) => {
  const newClaim = {
    id: claims.length + 1,
    userEmail: req.body.userEmail,
    userName: req.body.userName,
    policyType: req.body.policyType,
    claimType: req.body.claimType,
    claimAmount: req.body.claimAmount,
    incidentDate: req.body.incidentDate,
    description: req.body.description,
    documents: req.files || [],
    status: "Pending"
  };

  claims.push(newClaim);
  res.json({ message: "Claim submitted", claimId: newClaim.id });
});

// Example: Admin fetch all claims
router.get("/", (req, res) => {
  res.json(claims);
});

// Example: Admin updates status
router.post("/update", (req, res) => {
  const { id, status } = req.body;
  const claim = claims.find(c => c.id === parseInt(id));
  if (!claim) return res.status(404).json({ message: "Claim not found" });
  claim.status = status;
  res.json({ message: "Claim status updated", claim });
});

// Example: User fetch their claims
router.get("/user/:email", (req, res) => {
  const userClaims = claims.filter(c => c.userEmail === req.params.email);
  res.json(userClaims);
});

module.exports = router;
