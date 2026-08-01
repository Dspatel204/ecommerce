import React, { useState } from "react";
import axios from "axios";
import { CreditCard, Trash2, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { loadRazorpayScript } from "../utils/razorpay";

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

  const total = cartData.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

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
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please check your internet connection."
        );
      }

      const { data: order } = await axios.post("/api/create-order", {
        amount: total,
        currency: "INR",
      });

      if (!order || !order.id) {
        throw new Error(
          order?.error?.description || "Could not create a payment order."
        );
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "ABC Electronics Store",
        description: "Checkout payment",
        order_id: order.id,
        handler: () => {
          setPaid(true);
          clearCart();
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#0ea5e9" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert(err.message || "Payment could not be initiated.");
    } finally {
      setLoading(false);
    }
  };

  if (paid) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your order has been placed. A receipt has been sent to your email.
        </p>
      </section>
    );
  }

  if (cartData.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <Trash2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Add some products before checking out.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl space-y-6">
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
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-primary-600 focus:ring-primary-500 shadow-sm"
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Cart summary + payment */}
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
                <span className="text-gray-600 dark:text-gray-300">
                  Total Amount
                </span>
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
                <CreditCard className="h-5 w-5" />
                Pay {INR(total)} with Razorpay
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
