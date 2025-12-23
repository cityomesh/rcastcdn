const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { exec } = require("child_process");
const { Types } = require("mongoose");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Server Model Schema
const serverSchema = new mongoose.Schema({
  ipAddress: String,
  username: String,
  displayName: String
});
const Server = mongoose.model("Server", serverSchema);

// --- 1. AUTH ROUTES ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    res.json({
      success: true,
      token: "dummy-token-123",
      user: { id: "1", username: "admin", name: "Omesh Admin", isActive: true }
    });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

app.post("/api/auth/verify-token", (req, res) => {
  res.json({
    success: true,
    user: { id: "1", username: "admin", name: "Omesh Admin", isActive: true }
  });
});

// --- 2. DATA FETCHING ROUTES ---

// Get All Rules (DataContext fetches this)
app.get("/api/rules", async (req, res) => {
  try {
    // Return empty route structure to prevent frontend crash
    res.json({ 
      success: true, 
      data: { 
        SyncResponse: { Routes: [] } 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get All Route-Servers (NimbleHomeContent fetches this)
app.get("/api/route-servers", async (req, res) => {
  try {
    // Returns list of assigned servers
    res.json({ success: true, data: [] }); 
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Servers List
app.get("/api/servers", async (req, res) => {
  try {
    const servers = await Server.find({});
    res.json({ success: true, data: servers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. MANAGEMENT ROUTES ---

app.post("/api/servers/routes", async (req, res) => {
  try {
    const { serverId, route } = req.body;
    res.json({ success: true, message: "Route created successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/servers/routes", async (req, res) => {
  try {
    const { serverId, routeId } = req.query;
    res.json({ success: true, message: "Route deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 4. SERVER OPERATIONS ---

app.post("/api/restart-nimble", async (req, res) => {
  try {
    const { serverIds } = req.body;
    if (!serverIds || serverIds.length === 0) {
      return res.status(400).json({ success: false, message: "No servers selected" });
    }

    const servers = await Server.find({ _id: { $in: serverIds.map(id => new Types.ObjectId(id)) } });

    if (servers.length === 0) {
      return res.status(404).json({ success: false, message: "No matching servers found" });
    }

    servers.forEach((server) => {
      const { ipAddress, username } = server;
      const cmd = `ssh ${username}@${ipAddress} "sudo service nimble restart"`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) console.error(`❌ Error on ${ipAddress}:`, err.message);
        else console.log(`✅ Nimble restarted on ${ipAddress}`);
      });
    });

    res.json({ success: true, message: "Restart triggered for " + servers.length + " servers" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend Server is Running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://103.189.178.124:${PORT}`);
});
