import React, { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { payWithRazorpay } from "../utils/razorpay";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const formFields = [
  { name: "name", label: "Full Name", type: "text", required: true },
  { name: "email", label: "Email Address", type: "email", required: true },
  { name: "phone", label: "Phone Number", type: "tel", required: true },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "pincode", label: "Pincode", type: "text", required: true },
  { name: "city", label: "City", type: "text", required: true },
];

export default function Checkout() {
  const { cartData, removeFromCart, clearCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [apiError, setApiError] = useState("");

  const total = cartData.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  if (cartData.length === 0) {
    return (
      <section className="py-20 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Add some products before checking out.
        </p>
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "A valid email is required";
    if (!form.phone || !/^\d{10}$/.test(form.phone))
      errs.phone = "A valid 10-digit phone number is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    if (!form.city.trim()) errs.city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!validate() || cartData.length === 0) return;
    setApiError("");
    setLoading(true);
    try {
      await payWithRazorpay({
        amount: total,
        currency: "INR",
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        // Embedded mode: renders the Razorpay form inline inside #razorpay-embed
        containerId: "razorpay-embed",
        onSuccess: () => {
          setPaid(true);
          clearCart();
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      console.error(err);
      setApiError(
        err?.message || "Payment could not be initiated. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <section className="py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.615 3.905a2.75 2.75 0 11-5.5 0 2.75 2.75 0 015.5 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Successful!
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Your order has been placed and your cart has been cleared.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Enter your details and complete the payment securely via Razorpay.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Billing form */}
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-600 focus:ring-primary-500"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cart summary + pay */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Order Summary
            </h3>
            <div className="space-y-3">
              {cartData.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.images?.[0]}
                    alt={item.title}
                    className="h-12 w-12 flex-none rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.title}
                    </p>
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm text-gray-600 dark:text-gray-300">
                    {INR(item.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 rounded-md p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-600 dark:text-gray-300">Total</span>
                <span className="text-lg font-bold text-primary-700 dark:text-primary-400">
                  {INR(total)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-3 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h4l3-3 4 0 3 3 3 0v11a2 2 0 01-2 2H5a2 2 0 01-2-2V10z"
                  />
                </svg>
                Pay {INR(total)} with Razorpay
              </>
            )}
          </button>

          {apiError && (
            <p className="rounded-md border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {apiError}
            </p>
          )}

          {/* Razorpay embedded checkout container — the payment iframe renders here */}
          <div
            id="razorpay-embed"
            className="w-full overflow-hidden rounded-xl"
            style={{ minHeight: loading ? "420px" : "0" }}
          />

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Test gateway — use card <span className="font-mono">4111 1111 1111 1111</span>, any future expiry &amp; any CVV.
          </p>
        </div>
      </div>
    </section>
  );
}
