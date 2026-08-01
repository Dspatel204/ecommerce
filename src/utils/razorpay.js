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

    const raw = await res.text().catch(() => "");
    if (!res.ok) {
      throw new Error(
        `Could not create a Razorpay order (HTTP ${res.status}). ` +
          `Make sure the backend is running (npm run dev) and RAZORPAY_KEY_ID / ` +
          `RAZORPAY_KEY_SECRET are set. Response: ${raw.slice(0, 200)}`
      );
    }

    let order;
    if (raw) {
      try {
        order = JSON.parse(raw);
      } catch {
        throw new Error(
          `Invalid order response from /api/create-order: ${raw.slice(0, 200)}`
        );
      }
    } else {
      order = {};
    }

    if (!order || !order.id) {
      throw new Error(
        order?.error?.description ||
          "Could not create a Razorpay order (no order id returned)."
      );
    }
    orderId = order.id;
    if (typeof order.amount === "number") orderAmount = order.amount;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error(
          "Payment order could not be created. A backend (server.js or the Vercel " +
            "api/create-order function) and valid RAZORPAY_KEY_ID / " +
            "RAZORPAY_KEY_SECRET are required."
        );
  }

  const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error(
      "Razorpay key is not configured. " +
        "Add REACT_APP_RAZORPAY_KEY_ID to your Vercel environment variables and redeploy."
    );
  }

  const options = {
    key: keyId,
    amount: orderAmount,
    currency,
    name,
    description,
    order_id: orderId,
    prefill,
    theme: { color: "#0ea5e9" },
    handler: (response) => onSuccess(response),
    modal: {
      ondismiss: () => {
        // User closed the Razorpay popup — not an error, no-op
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
