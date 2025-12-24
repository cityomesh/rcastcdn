const { exec } = require("child_process");
const { Types } = require("mongoose");

app.post("/api/restart-nimble", async (req, res) => {
  try {
    const { serverIds } = req.body;
    if (!serverIds || serverIds.length === 0) {
      return res.status(400).json({ success: false, message: "No servers selected" });
    }

    // Convert IDs to ObjectId if necessary
    const servers = await Server.find({ _id: { $in: serverIds.map(id => Types.ObjectId(id)) } });

    if (servers.length === 0) {
      return res.status(404).json({ success: false, message: "No matching servers found" });
    }

    servers.forEach((server) => {
      const { ipAddress, username } = server;
      const cmd = `ssh ${username}@${ipAddress} "sudo service nimble restart"`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) console.error(`❌ Error on ${ipAddress}:`, err.message);
        if (stderr) console.warn(`⚠️ stderr (${ipAddress}):`, stderr);
        else console.log(`✅ Nimble restarted on ${ipAddress}`);
      });
    });

    res.json({ success: true, message: "Restart triggered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
