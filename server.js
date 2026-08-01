const http = require("http");
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Razorpay backend is running");
});

app.post("/api/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body || {};

  if (!amount || isNaN(Number(amount))) {
    return res.status(400).json({ error: "amount is required and must be a number" });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error("[create-order] Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in environment");
    return res.status(500).json({
      error: "Server misconfiguration: Razorpay credentials not set. Check your .env file.",
    });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // ₹ → paise
      currency,
      receipt: `order_${Date.now()}`,
    });

    return res.status(200).json(order);
  } catch (err) {
    const msg = err?.error?.description || err?.message || String(err);
    console.error("[create-order] Razorpay error:", msg);
    return res.status(500).json({ error: `Could not create Razorpay order: ${msg}` });
  }
});

// ─── Server — use http.createServer so we can raise maxHeaderSize ──────────
// Default Node.js limit is 8 KB; browsers can send large cookie headers
// that exceed this, causing HTTP 431. We raise it to 64 KB here.
const PORT = process.env.PORT || 5000;

const server = http.createServer(
  { maxHeaderSize: 65536 }, // 64 KB  ← fixes HTTP 431
  app
);

server.listen(PORT, () =>
  console.log(`[server] Running on http://localhost:${PORT}`)
);
