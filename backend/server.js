const express = require("express");
const fs = require("fs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// JWT Secrets
const ACCESS_SECRET = "access-secret-key";
const REFRESH_SECRET = "refresh-secret-key";

// Load users
function loadUsers() {
  if (!fs.existsSync("./users.json")) return [];
  return JSON.parse(fs.readFileSync("./users.json"));
}

// Save users
function saveUsers(users) {
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

// Generate Access Token (short expiry)
function generateAccessToken(user) {
  return jwt.sign({ name: user.name }, ACCESS_SECRET, { expiresIn: "15m" });
}

// Generate Refresh Token (long expiry)
function generateRefreshToken(user) {
  return jwt.sign({ name: user.name }, REFRESH_SECRET, { expiresIn: "7d" });
}


// =========================== REGISTER ===========================
app.post("/register", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password)
    return res.status(400).json({ message: "All fields required" });

  let users = loadUsers();

  if (users.find(u => u.name === name))
    return res.status(400).json({ message: "User already exists" });

  users.push({ name, password, refreshToken: null });
  saveUsers(users);

  res.json({ message: "Registration Successful!" });
});


// =========================== LOGIN ===========================
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  let users = loadUsers();
  const user = users.find(
    u => u.name === name && u.password === password
  );

  if (!user)
    return res.status(401).json({ message: "Invalid Credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  saveUsers(users);

  res.json({
    message: "Login Successful",
    accessToken,
    refreshToken,
    name: user.name
  });
});


// =========================== REFRESH TOKEN ===========================
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  let users = loadUsers();
  const user = users.find(u => u.refreshToken === refreshToken);

  if (!user)
    return res.status(403).json({ message: "Invalid refresh token" });

  jwt.verify(refreshToken, REFRESH_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Token expired" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});


// =========================== LOGOUT ===========================
app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;
  let users = loadUsers();

  const user = users.find(u => u.refreshToken === refreshToken);
  if (!user) return res.json({ message: "Already logged out" });

  user.refreshToken = null;
  saveUsers(users);

  res.json({ message: "Logged out successfully" });
});


// =========================== START SERVER ===========================
app.listen(5000, () => {
  console.log("Backend running with JWT on http://localhost:5000");
});
