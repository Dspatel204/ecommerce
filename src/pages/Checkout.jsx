import React, { useState, useRef, useEffect } from "react";
import { ShoppingCart, Trash2, Download, QrCode } from "lucide-react";
import { useCart } from "../context/CartContext";
import { payWithRazorpay } from "../utils/razorpay";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QRCodeCanvas } from "qrcode.react";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const BRAND = {
  name: "ABC Electronics Store",
  tagline: "Your One Stop Tech Shop",
  gstin: "07AABCU9603R1ZM",
  address: "123 Business Street, Surat, Gujarat - 395003",
  phone: "+91 98765 43210",
  email: "contact@abcelectronics.com",
  logo: "🛒",
};

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
  const [showBill, setShowBill] = useState(false);
  const [apiError, setApiError] = useState("");
  const billRef = useRef(null);

  const total = cartData.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const cartItemCount = cartData.reduce(
    (sum, item) => sum + (item.quantity || 1),
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

  const downloadBillPDF = async () => {
    const billNo = `INV-${Date.now()}`;
    const date = new Date().toLocaleDateString("en-IN");
    const time = new Date().toLocaleTimeString("en-IN");

    const doc = new jsPDF();
    const X = 14;
    const right = 196;

    // Header
    doc.setFillColor(13, 102, 189);
    doc.rect(0, 0, 210, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`${BRAND.logo} ${BRAND.name}`, X, 13);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(BRAND.tagline, X, 17.5);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TAX INVOICE", right, 13, { align: "right" });

    doc.setFontSize(6.8);
    doc.text(`GSTIN: ${BRAND.gstin}`, X, 31);
    doc.text(BRAND.address, X, 34);
    doc.text(`Phone: ${BRAND.phone}  |  Email: ${BRAND.email}`, X, 37);

    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice No.: ${billNo}`, right, 31, { align: "right" });
    doc.text(`Date: ${date}`, right, 34, { align: "right" });
    doc.text(`Time: ${time}`, right, 37, { align: "right" });
    doc.text("Place of Supply: Gujarat (24)", right, 40, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(X, 42, right, 42);

    // Biller & Customer
    doc.setFontSize(6.8);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "bold");
    doc.text("Biller (Seller):", X, 48);
    doc.setFont("helvetica", "normal");
    doc.text(BRAND.name, X, 51);
    doc.text(`GSTIN: ${BRAND.gstin}`, X, 53.5);
    doc.text(BRAND.address, X, 56);
    doc.text(`Phone: ${BRAND.phone}`, X, 58.5);

    doc.setFont("helvetica", "bold");
    doc.text("Customer:", X, 63);
    doc.setFont("helvetica", "normal");
    doc.text(form.name || "Checkout Customer", X, 66);
    doc.text(`Email: ${form.email || "N/A"}`, X, 68.5);
    doc.line(X, 71, right, 71);

    // Items table
    const tableData = cartData.map((item, i) => {
      const qty = item.quantity || 1;
      const gstAmt = (item.price * qty * 18) / 100;
      return [
        i + 1,
        item.title,
        qty,
        INR(item.price),
        "18%",
        INR(gstAmt),
        INR(item.price * qty + gstAmt),
      ];
    });

    autoTable(doc, {
      startY: 74,
      margin: { left: X, right: X },
      head: [
        [
          "S.No",
          "Item / Description",
          "Qty",
          "Price",
          "GST%",
          "GST Amt",
          "Total",
        ],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 7.2, cellPadding: 2.5, lineWidth: 0.2 },
      headStyles: {
        fillColor: [13, 102, 189],
        textColor: [255, 255, 255],
        fontSize: 7.2,
        fontStyle: "bold",
      },
      bodyStyles: { textColor: [55, 60, 70] },
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 62 },
        2: { cellWidth: 12, halign: "center" },
        3: { cellWidth: 20, halign: "right" },
        4: { cellWidth: 14, halign: "center" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 22, halign: "right" },
      },
    });

    // Totals
    const subtotal = cartData.reduce(
      (s, i) => s + i.price * (i.quantity || 1),
      0
    );
    const totalGST = cartData.reduce(
      (s, i) => s + (i.price * (i.quantity || 1) * 18) / 100,
      0
    );
    const grandTotal = subtotal + totalGST;

    const y = doc.lastAutoTable.finalY + 8;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(X, y - 4, right, y - 4);

    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", right - 34, y, { align: "right" });
    doc.text(INR(subtotal), right, y, { align: "right" });

    const gstAmt18 = (subtotal * 18) / 100;
    const row = y + 5;
    doc.text("GST 18%:", right - 34, row, { align: "right" });
    doc.text(INR(gstAmt18), right, row, { align: "right" });

    doc.line(X, row + 4, right, row + 4);
    doc.text("Total Tax:", right - 34, row + 9, { align: "right" });
    doc.text(INR(totalGST), right, row + 9, { align: "right" });

    doc.line(X, row + 12, right, row + 12);
    doc.setTextColor(13, 102, 189);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", right - 38, row + 17.5, { align: "right" });
    doc.text(INR(grandTotal), right, row + 17.5, { align: "right" });

    // QR Code
    const qrY = row + 22;
    doc.setFontSize(6.5);
    doc.setTextColor(90, 90, 90);
    doc.text("Bill QR Code:", X, qrY);
    const qrValue = JSON.stringify({
      billNo,
      date,
      total: grandTotal,
      items: cartData.map((i) => ({
        title: i.title,
        qty: i.quantity || 1,
        price: i.price,
      })),
    });
    const qrDataUrl = await QRCodeCanvas.toDataURL(qrValue, {
      width: 80,
      margin: 1,
    });
    doc.addImage(qrDataUrl, "PNG", X, qrY + 2, 20, 20);

    // Footer
    const foot = qrY + 28;
    doc.setDrawColor(210, 210, 210);
    doc.line(X, foot - 3, right, foot - 3);
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for shopping with us! | Computer-generated GST invoice.",
      X,
      foot
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Bank: ${BRAND.name}`, X, foot + 3.5);
    doc.text("A/c No: 123456789012 | IFSC: HDFCO0001234", X, foot + 7);

    doc.save(`billing-${billNo}.pdf`);
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
        onSuccess: () => {
          setPaid(true);
          clearCart();
          // Auto-show bill popup and download PDF
          setShowBill(true);
          setTimeout(() => {
            downloadBillPDF();
          }, 500);
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
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove "${item.title}" from cart?`
                        )
                      )
                        removeFromCart(item.id);
                    }}
                    className="shrink-0 rounded-md p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Test gateway — use card{" "}
            <span className="font-mono">4111 1111 1111 1111</span>, any future
            expiry &amp; any CVV.
          </p>
        </div>
      </div>

      {/* Bill Popup Modal */}
      {showBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                Bill Downloaded
              </h2>
              <button
                type="button"
                onClick={() => setShowBill(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-6 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
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
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Successful!
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Your bill is being downloaded automatically.
                </p>
              </div>

              {/* QR Code in popup */}
              <div className="flex justify-center">
                <QRCodeCanvas
                  value={JSON.stringify({
                    billNo: `INV-${Date.now()}`,
                    total,
                    items: cartData.map((i) => ({
                      title: i.title,
                      qty: i.quantity || 1,
                      price: i.price,
                    })),
                  })}
                  size={120}
                  level="M"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Scan this QR code to verify your bill
              </p>

              <button
                type="button"
                onClick={() => {
                  downloadBillPDF();
                  setShowBill(false);
                }}
                className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <Download className="h-4 w-4" />
                Re-download Bill (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}