const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const nodemailer = require("nodemailer");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
connectDB();
app.use(cors());
app.use(bodyParser.json());

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
    user: "your-email@gmail.com", // SAME Gmail
    pass: "YOUR_16_CHAR_APP_PASSWORD", // App password
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email config error:", error);
  } else {
    console.log("✅ Email server ready");
  }
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
// DATABASE (CLAIMS)
// =====================
const db = new sqlite3.Database("claims.db");

db.run(`
  CREATE TABLE IF NOT EXISTS claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policyType TEXT,
    claimType TEXT,
    claimAmount TEXT,
    incidentDate TEXT,
    description TEXT,
    status TEXT
  )
`);

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
  return jwt.sign(
    { email: user.email },
    ACCESS_SECRET,
    { expiresIn: "1d" } // ⬅️ CHANGED
  );
}


function generateRefreshToken(user) {
  return jwt.sign({ email: user.email }, REFRESH_SECRET, { expiresIn: "7d" });
}

// =====================
// AUTH MIDDLEWARE
// =====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log("AUTH HEADER:", authHeader); // 👈 ADD

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) {
      console.error("JWT ERROR:", err.message); // 👈 ADD
      return res.status(403).json({ message: "Invalid or expired token" });
    }
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

  users.push({
    email,
    password,
    first_name,
    last_name,
    phone_number,
    refreshToken: null,
  });

  saveUsers(users);
  res.status(201).json({ message: "Registration Successful!" });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) return res.status(401).json({ message: "Invalid Credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  saveUsers(users);

  res.json({
    message: "Login Successful",
    accessToken,
    refreshToken,
    email: user.email,
  });
});

app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

  const users = loadUsers();
  const user = users.find((u) => u.refreshToken === refreshToken);
  if (!user) return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(refreshToken, REFRESH_SECRET, (err) => {
    if (err) return res.status(403).json({ message: "Token expired" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.refreshToken === refreshToken);

  if (user) {
    user.refreshToken = null;
    saveUsers(users);
  }

  res.json({ message: "Logged out successfully" });
});

// =====================
// POLICIES
// =====================
app.get("/policies", (req, res) => {
  res.json(loadPolicies());
});

app.get("/policies/type/:type", (req, res) => {
  const type = req.params.type.toLowerCase();
  const policies = loadPolicies().filter(
    (p) => p.type && p.type.toLowerCase() === type
  );
  res.json(policies);
});

// =====================
// PREMIUM CALCULATOR
// =====================
app.post("/calculate-premium", (req, res) => {
  let { age, coverage, deductible, location, smoking } = req.body;

  age = Number(age);
  coverage = Number(coverage);
  deductible = Number(deductible);
  smoking = Boolean(smoking);

  let premium = 2000;
  if (age > 30) premium += 1000;
  if (age > 50) premium += 2000;
  premium += coverage / 100;
  premium -= deductible / 10;
  if (smoking) premium += 700;

  res.json({
    yearlyPremium: premium,
    monthlyPremium: (premium / 12).toFixed(2),
  });
});

// =====================
// FILE A CLAIM + EMAIL CONFIRMATION (FIXED)
// =====================
app.post(
  "/api/claims",
  authenticateToken,
  upload.array("documents"),
  async (req, res) => {
    const { policyType, claimType, claimAmount, incidentDate, description } = req.body;
    const email = req.user.email; // ✅ logged-in user's email

    const status = "Submitted";

    db.run(
      `INSERT INTO claims
       (policyType, claimType, claimAmount, incidentDate, description, status)
       VALUES (?,?,?,?,?,?)`,
      [policyType, claimType, claimAmount, incidentDate, description, status],
      async function () {
        const claimId = this.lastID;

        // ✅ MAIL OPTIONS (FIXED)
        const mailOptions = {
          from: `"Insurance Team" <YOUR_GMAIL@gmail.com>`, // MUST match auth user
          to: email, // ✅ logged-in user's email
          subject: "✅ Claim Submitted Successfully",
          text: `Hello,

Your claim has been submitted successfully.

Claim ID: ${claimId}
Policy Type: ${policyType}
Claim Type: ${claimType}
Claim Amount: ${claimAmount}
Incident Date: ${incidentDate}

Status: ${status}

Thank you,
Insurance Team`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log("✅ Email sent successfully to:", email);
        } catch (mailError) {
          console.error("❌ Email sending failed:", mailError);
        }

        res.json({
          message: "Claim submitted successfully",
          claimId,
        });
      }
    );
  }
);

// =====================
// TRACK A CLAIM
// =====================
app.get("/api/claims/:id", (req, res) => {
  db.get("SELECT * FROM claims WHERE id = ?", [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ message: "Claim not found" });
    res.json(row);
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});