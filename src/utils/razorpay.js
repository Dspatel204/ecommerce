export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * amount        -> numeric, in RUPES (converted to paise for Razorpay)
 * currency      -> default "INR"
 * prefill       -> { name, email, contact } shown pre-filled in the checkout
 * onSuccess     -> called from the checkout `handler` after a successful payment
 *
 * Order creation: Razorpay Checkout REQUIRES a genuine order_id created
 * server-side with your secret key (the Orders API is not CORS-enabled, and any
 * placeholder/dummy order_id is rejected with 400). So this helper always
 * POSTs to /api/create-order, which must be served by a backend:
 *  - Local dev: CRA `proxy` -> Express `server.js` (npm run dev, not bare npm start)
 *  - Production: Vercel serverless function `api/create-order.js`
 *
 * TEST-only: no real money is moved. Test card: 4111 1111 1111 1111
 * (any future expiry, any CVV; in test mode the OTP field accepts any value).
 */
export async function payWithRazorpay({
  amount,
  currency = "INR",
  prefill = {},
  name = "ABC Electronics Store",
  description = "Checkout payment",
  onSuccess = () => {},
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error(
      "Razorpay checkout could not be loaded. Please check your internet connection."
    );
  }

  const amountPaise = Math.round(amount * 100);
  let orderAmount = amountPaise;
  let orderId = null;

  // Razorpay Checkout requires a REAL order_id created server-side with your
  // secret key. The Orders API is NOT CORS-enabled, so this cannot be done
  // from the browser alone. A dummy/placeholder order_id is rejected (400).
  try {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency }),
    });
    const order = await res.json();
    if (!order || !order.id) {
      throw new Error(
        order?.error?.description || "Could not create a Razorpay order."
      );
    }
    orderId = order.id;
    if (typeof order.amount === "number") orderAmount = order.amount;
  } catch (err) {
    throw new Error(
      err?.message ||
        "Payment order could not be created. A backend (server.js or the Vercel api/create-order function) and valid RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are required."
    );
  }

  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: orderAmount,
    currency,
    name,
    description,
    order_id: orderId,
    prefill,
    theme: { color: "#0ea5e9" },
    handler: () => onSuccess(),
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
