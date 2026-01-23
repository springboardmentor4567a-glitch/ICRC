const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
require("dotenv").config();

const connectDB = require("./db");
const Claim = require("./models/Claim");
const claimsRoutes = require("./claimsRoutes");

const app = express(); // ✅ Initialize app first
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/claims", claimsRoutes); // ✅ after app is initialized


// =====================
// JWT SECRETS
// =====================
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh-secret-key";

// =====================
// EMAIL SETUP
// =====================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com",
    pass: "YOUR_16_CHAR_APP_PASSWORD",
  },
});

// =====================
// FILE UPLOAD (CLAIMS)
// =====================
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// =====================
// UTILITY FUNCTIONS
// =====================
function loadUsers() {
  if (!fs.existsSync("./users.json")) return [];
  return JSON.parse(fs.readFileSync("./users.json", "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

function loadPolicies() {
  const dataPath = path.join(__dirname, "data", "policies.json");
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function generateAccessToken(user) {
  return jwt.sign({ email: user.email }, ACCESS_SECRET, { expiresIn: "1d" });
}

function generateRefreshToken(user) {
  return jwt.sign({ email: user.email }, REFRESH_SECRET, { expiresIn: "7d" });
}

// =====================
// AUTH MIDDLEWARE
// =====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// =====================
// AUTH ROUTES
// =====================
app.post("/register", (req, res) => {
  const { email, password, first_name, last_name, phone_number } = req.body;
  if (!email || !password || !first_name || !last_name || !phone_number)
    return res.status(400).json({ message: "All fields required" });

  const users = loadUsers();
  if (users.find((u) => u.email === email))
    return res.status(400).json({ message: "User already exists" });

  users.push({ email, password, first_name, last_name, phone_number, refreshToken: null });
  saveUsers(users);
  res.status(201).json({ message: "Registration Successful!" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid Credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  saveUsers(users);

  res.json({ message: "Login Successful", accessToken, refreshToken, email: user.email });
});

// =====================
// POLICIES
// =====================
app.get("/policies", (req, res) => {
  res.json(loadPolicies());
});

// =====================
// FILE A CLAIM (MONGODB)
// =====================
app.post("/api/claims", authenticateToken, upload.array("documents"), async (req, res) => {
  const { policyType, claimType, claimAmount, incidentDate, description } = req.body;
  const email = req.user.email;

  const newClaim = new Claim({
    userEmail: email,
    policyType,
    claimType,
    claimAmount,
    incidentDate,
    description,
    status: "Submitted",
  });

  await newClaim.save();

  await transporter.sendMail({
    from: `"Insurance Team" <your-email@gmail.com>`,
    to: email,
    subject: "Claim Submitted Successfully",
    text: `Your claim has been submitted.\n\nStatus: Submitted\nAmount: ₹${claimAmount}`,
  });

  res.json({ message: "Claim submitted successfully", claimId: newClaim._id });
});

// =====================
// USER → VIEW THEIR CLAIMS
// =====================
app.get("/api/my-claims", authenticateToken, async (req, res) => {
  const claims = await Claim.find({ userEmail: req.user.email });
  res.json(claims);
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
