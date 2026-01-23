const jwt = require("jsonwebtoken");
require("dotenv").config();

const ACCESS_SECRET = process.env.ACCESS_SECRET || "access-secret-key";

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
