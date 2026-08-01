// Vercel Serverless Function (deployed at /api/create-order)
const Razorpay = require("razorpay");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body =
    typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const { amount, currency = "INR" } = body;

  if (!amount) {
    res.status(400).json({ error: "amount is required" });
    return;
  }

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `order_${Date.now()}`,
    });

    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay order error:", err?.message || err);
    res.status(500).json({ error: "Could not create Razorpay order" });
  }
};
