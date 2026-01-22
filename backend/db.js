const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/insurance"
    );
    console.log("✅ MongoDB Connected (Main Backend)");
  } catch (error) {
    console.error("❌ Main Backend MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
