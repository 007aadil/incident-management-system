require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const pool = require("./db");
const { enqueue } = require("./queue");
const { addRCA } = require("./rcaManager");
const { updateIncidentStatus } = require("./incidentManager");

require("./worker");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100
});

app.use(limiter);

app.post("/signal", (req, res) => {
  const { component, type, message } = req.body;

  if (!component || !type || !message) {
    return res.status(400).json({
      error: "component, type and message are required"
    });
  }

  enqueue({
    component,
    type,
    message,
    timestamp: Date.now()
  });

  res.status(202).json({
    message: "Signal received"
  });
});

app.get("/incidents", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM incidents ORDER BY start_time DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch incidents failed:", err.message);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

app.get("/incident/:id/signals", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM signals
       WHERE incident_id = $1
       ORDER BY timestamp DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch signals failed:", err.message);
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

app.post("/rca/:id", (req, res) => {
  try {
    addRCA(req.params.id, req.body);

    res.json({
      message: "RCA added"
    });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

app.patch("/incident/:id/status", async (req, res) => {
  try {
    await updateIncidentStatus(req.params.id, req.body.status);

    res.json({
      message: "Status updated"
    });
  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});