const jwt = require('jsonwebtoken');
const JWT_ACCESS_SECRET = 'supersecret_access_key_123';   // demo only
const JWT_REFRESH_SECRET = 'supersecret_refresh_key_456'; // demo only

console.log("✅ server.js file is starting...");

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

//  JWT HELPERS

// Middleware to check access token from "Authorization: Bearer <token>"
function authenticateAccessToken(req, res, next) {
    const authHeader = req.headers['authorization']; // e.g. "Bearer token"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    jwt.verify(token, JWT_ACCESS_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Access token verify error:', err.message);
            return res.status(403).json({ message: 'Invalid or expired access token' });
        }

        req.user = user; // store decoded payload
        next();
    });
}

//  DATABASE SETUP

// Database path
const dbPath = path.join(__dirname, 'database.db');

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ DB Error:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// Create users table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )
`, (err) => {
    if (err) {
        console.error("❌ Table Error:", err.message);
    } else {
        console.log("✅ Users table ready.");
    }
});

// ROUTES

// Test route
app.get('/', (req, res) => {
    res.send("Backend is running ✅");
});

// Register API
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    const sql = `INSERT INTO users(name, email, password) VALUES (?, ?, ?)`;

    db.run(sql, [name, email, password], function (err) {
        if (err) {
            console.error("❌ Registration error:", err.message);
            return res.status(400).json({ message: "Email already exists" });
        }

        res.json({ message: "✅ Registration success" });
    });
});

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ?`;

    db.get(sql, [email], (err, user) => {
        if (err) {
            console.error("❌ Login error:", err.message);
            return res.status(500).json({ message: "Server error" });
        }

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password" });
        }

        // ✅ create ACCESS TOKEN (short-lived)
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },  // payload
            JWT_ACCESS_SECRET,                   // secret
            { expiresIn: "15m" }                 // 15 minutes expiry
        );

        // ✅ create REFRESH TOKEN (longer-lived)
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" }                  // 7 days expiry
        );

        // ✅ send BOTH tokens in response
        res.json({
            message: "✅ Login success",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            tokens: {
                accessToken,
                refreshToken
            }
        });
    });
});

// Refresh Token API (to get new accessToken using refreshToken)
app.post('/api/refresh-token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token required" });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Refresh token verify error:', err.message);
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        // create new access token
        const newAccessToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_ACCESS_SECRET,
            { expiresIn: "15m" }
        );

        res.json({
            message: "✅ New access token generated",
            accessToken: newAccessToken
        });
    });
});

// Example PROTECTED route (needs accessToken in Authorization header)
app.get('/api/profile', authenticateAccessToken, (req, res) => {
    // req.user comes from token payload
    res.json({
        message: "✅ Protected profile data",
        user: req.user
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ API Server running at http://localhost:${PORT}`);
});
