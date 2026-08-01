/**
 * Razorpay Embedded Checkout Helper
 * ─────────────────────────────────
 * Uses Razorpay's "embedded" checkout which renders the payment form
 * INSIDE the page (inline iframe) rather than a floating modal popup.
 *
 * Embedded vs Popup:
 *  - Popup  : window.Razorpay(opts).open()  — opens a modal overlay
 *  - Embedded: provide `options.container`  — renders inline in a DOM element
 *
 * The checkout.js script (v1) supports both modes via the same CDN URL.
 *
 * Test card (TEST mode — no real money moved):
 *   Card: 4111 1111 1111 1111 | Expiry: any future | CVV: any | OTP: any
 */

// ─── Script loader ─────────────────────────────────────────────────────────────
let _scriptPromise = null;

export function loadRazorpayScript() {
  if (_scriptPromise) return _scriptPromise; // deduplicate concurrent calls

  _scriptPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    // v1 checkout supports both popup AND embedded modes
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      _scriptPromise = null; // allow retry on next call
      resolve(false);
    };
    document.head.appendChild(script); // <head> not <body> — avoids layout shift
  });

  return _scriptPromise;
}

// ─── Order creation (server-side, not CORS-enabled by Razorpay) ───────────────
async function createOrder(amount, currency) {
  // Send ONLY Content-Type — stripping all other headers keeps the request
  // tiny and prevents HTTP 431 "Request Header Fields Too Large" on localhost.
  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // credentials: "omit" → do NOT send cookies — this alone eliminates 431
    credentials: "omit",
    body: JSON.stringify({ amount, currency }),
  });

  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(raw);
      errMsg = parsed?.error || parsed?.message || errMsg;
    } catch {
      errMsg = raw.slice(0, 200) || errMsg;
    }
    throw new Error(
      `Could not create a Razorpay order (${errMsg}). ` +
        "Make sure the backend is running (npm run dev) and " +
        "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set in your .env file."
    );
  }

  let order;
  try {
    order = JSON.parse(raw);
  } catch {
    throw new Error(
      `Invalid JSON from /api/create-order: ${raw.slice(0, 200)}`
    );
  }

  if (!order?.id) {
    throw new Error(
      order?.error?.description ||
        "Razorpay order creation returned no order id."
    );
  }

  return order;
}

// ─── Main payment helper ───────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {number}   opts.amount       - Amount in ₹ (converted to paise internally)
 * @param {string}  [opts.currency]    - Default: "INR"
 * @param {object}  [opts.prefill]     - { name, email, contact }
 * @param {string}  [opts.name]        - Merchant / store name shown in checkout
 * @param {string}  [opts.description] - Order description shown in checkout
 * @param {string}  [opts.containerId] - DOM element id to embed checkout into.
 *                                       If omitted, falls back to popup mode.
 * @param {function} [opts.onSuccess]  - Called with Razorpay response on success
 * @param {function} [opts.onDismiss]  - Called when user closes checkout
 */
export async function payWithRazorpay({
  amount,
  currency = "INR",
  prefill = {},
  name = "ABC Electronics Store",
  description = "Checkout payment",
  containerId = "razorpay-embed", // id of the container div for embedded mode
  onSuccess = () => {},
  onDismiss = () => {},
}) {
  // 1. Load the Razorpay checkout.js script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error(
      "Razorpay checkout could not be loaded. Please check your internet connection."
    );
  }

  // 2. Create a server-side order (required — CORS-disabled Razorpay Orders API)
  const order = await createOrder(amount, currency);

  // 3. Resolve the publishable key baked in at CRA build time
  const keyId =
    process.env.REACT_APP_RAZORPAY_KEY_ID ||
    (typeof window !== "undefined" && window.__RAZORPAY_KEY_ID__) ||
    "";

  if (!keyId || keyId === "undefined") {
    throw new Error(
      "Razorpay key is not configured. " +
        "Add REACT_APP_RAZORPAY_KEY_ID to your .env (local) or " +
        "Vercel → Settings → Environment Variables, then redeploy."
    );
  }

  // 4. Determine embedded vs popup mode
  const containerEl = containerId
    ? document.getElementById(containerId)
    : null;

  const options = {
    key: keyId,
    amount: order.amount,   // use the server-confirmed amount in paise
    currency,
    name,
    description,
    order_id: order.id,
    prefill,
    theme: { color: "#0ea5e9" },

    // ── Embedded checkout config ─────────────────────────────────────────
    // When `container` is set, Razorpay renders an inline iframe inside
    // that element instead of opening a floating modal/popup.
    ...(containerEl
      ? {
          container: `#${containerId}`,
          hidden: {
            // pass any hidden fields Razorpay should pre-set
          },
        }
      : {}),

    // ── Callbacks ────────────────────────────────────────────────────────
    handler: (response) => {
      // Called by Razorpay after a successful payment (popup AND embedded)
      onSuccess(response);
    },
    modal: {
      animation: true,
      backdropclose: false,  // prevent accidental dismiss on background click
      escape: true,
      confirm_close: true,   // show "Are you sure?" before closing
      ondismiss: () => {
        onDismiss();
      },
    },
  };

  // 5. Open the checkout (embedded if container exists, popup otherwise)
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay(options);

    // wire payment.failed so card declines / network errors surface as errors
    rzp.on("payment.failed", (response) => {
      reject(
        new Error(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment failed. Please try again."
        )
      );
    });

    rzp.open();
    resolve(); // resolves once the checkout UI is open
  });
}
