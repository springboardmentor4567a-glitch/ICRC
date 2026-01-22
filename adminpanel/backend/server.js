const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Admin Backend Running");
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
