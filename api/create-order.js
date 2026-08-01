// Vercel Serverless Function (deployed at /api/create-order)
// node_modules/razorpay must be in `dependencies` (not devDependencies) for Vercel to bundle it
const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  // Allow CORS from the same origin (needed when Vercel front-end calls the API)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // Vercel auto-parses JSON bodies, but guard against raw string payloads
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { amount, currency = "INR" } = body;

  if (!amount || isNaN(Number(amount))) {
    res.status(400).json({ error: "amount is required and must be a number" });
    return;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error(
      "Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel → Settings → Environment Variables."
    );
    res.status(500).json({
      error:
        "Server misconfiguration: Razorpay credentials are not set. Contact the site administrator.",
    });
    return;
  }

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // convert ₹ → paise
      currency,
      receipt: `order_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    const msg = err?.error?.description || err?.message || String(err);
    console.error("Razorpay order creation failed:", msg);
    res.status(500).json({ error: `Could not create Razorpay order: ${msg}` });
  }
};
