const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");

const app = express();
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.get("/", (req, res) => {
  res.send("Razorpay backend is running");
});

app.post("/api/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body || {};

  if (!amount) {
    return res.status(400).json({ error: "amount is required" });
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay order error:", err?.message || err);
    res.status(500).json({ error: "Could not create Razorpay order" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
