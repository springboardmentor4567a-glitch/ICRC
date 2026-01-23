// backend/models/Claim.js
const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  policyType: { type: String, required: true },
  claimType: { type: String, required: true },
  claimAmount: { type: Number, required: true },
  incidentDate: { type: String, required: true },
  description: { type: String, required: true },
  documents: { type: [String], default: [] },
  status: { type: String, default: "Submitted" },
  fraudScore: { type: Number, default: 20 }
}, { timestamps: true });

module.exports = mongoose.model("Claim", claimSchema);
