import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, FileText, Trash2, Receipt, Calendar, Clock } from "lucide-react";

const BRAND = {
  name: "ABC Electronics Store",
  tagline: "Your One Stop Tech Shop",
  gstin: "07AABCU9603R1ZM",
  address: "123 Business Street, Surat, Gujarat - 395003",
  phone: "+91 98765 43210",
  email: "contact@abcelectronics.com",
  logo: "🛒",
};

const CUSTOMER = {
  name: "Rahul Sharma",
  gstin: "27AARPS1234E1Z5",
  address: "45 Sector 15, Vadodara, Gujarat - 390015",
  phone: "+91 90234 56789",
};

const DEFAULT_ITEMS = [
  { id: 1, name: "Apple iPhone 15", qty: 1, price: 79900, gst_rate: 18 },
  { id: 2, name: "Samsung Galaxy Buds", qty: 2, price: 12990, gst_rate: 18 },
  { id: 3, name: "Adidas T-Shirt", qty: 3, price: 1599, gst_rate: 12 },
  { id: 4, name: "Himalaya Face Wash", qty: 2, price: 125, gst_rate: 18 },
];

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

function calculateTotals(items) {
  let subtotal = 0;
  let totalGST = 0;
  const gstBreakdown = {};

  items.forEach((item) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    const gstAmount = (itemTotal * item.gst_rate) / 100;
    totalGST += gstAmount;
    gstBreakdown[item.gst_rate] =
      (gstBreakdown[item.gst_rate] || 0) + gstAmount;
  });

  const total = subtotal + totalGST;
  return {
    subtotal,
    totalGST,
    total,
    gstBreakdown,
  };
}

export default function GSTBillSample() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [downloading, setDownloading] = useState(false);

  const totals = calculateTotals(items);
  const billNo = `INV-${Date.now()}`;
  const date = new Date().toLocaleDateString("en-IN");
  const time = new Date().toLocaleTimeString("en-IN");

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const downloadPDF = () => {
    if (items.length === 0) return;
    setDownloading(true);

    const doc = new jsPDF();
    const X = 14;
    const right = 196;

    // ---- Branded header band ----
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

    // Company details
    doc.setFontSize(6.8);
    doc.text(`GSTIN: ${BRAND.gstin}`, X, 31);
    doc.text(BRAND.address, X, 34);
    doc.text(`Phone: ${BRAND.phone}  |  Email: ${BRAND.email}`, X, 37);

    // Invoice meta
    doc.setTextColor(40, 40, 40);
    doc.text(`Invoice No.: ${billNo}`, right, 31, { align: "right" });
    doc.text(`Date: ${date}`, right, 34, { align: "right" });
    doc.text(`Time: ${time}`, right, 37, { align: "right" });
    doc.text("Place of Supply: Gujarat (24)", right, 40, { align: "right" });

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(X, 42, right, 42);

    // Biller (Seller) and Customer (Buyer)
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
    doc.text("Customer / Buyer:", X, 63);
    doc.setFont("helvetica", "normal");
    doc.text(CUSTOMER.name, X, 66);
    doc.text(`GSTIN: ${CUSTOMER.gstin}`, X, 68.5);
    doc.text(CUSTOMER.address, X, 71);
    doc.text(`Phone: ${CUSTOMER.phone}`, X, 73.5);

    doc.line(X, 75.5, right, 75.5);

    // ---- Items table ----
    const tableData = items.map((item, i) => [
      i + 1,
      item.name,
      item.qty,
      INR(item.price),
      `${item.gst_rate}%`,
      INR((item.price * item.qty * item.gst_rate) / 100),
      INR(
        item.price * item.qty +
          (item.price * item.qty * item.gst_rate) / 100
      ),
    ]);

    autoTable(doc, {
      startY: 78,
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

    // ---- Totals block ----
    const y = doc.lastAutoTable.finalY + 8;
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(X, y - 4, right, y - 4);

    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", right - 34, y, { align: "right" });
    doc.text(INR(totals.subtotal), right, y, { align: "right" });

    let row = y + 5;
    Object.entries(totals.gstBreakdown).forEach(([rate, amount]) => {
      doc.text(`GST ${rate}%:`, right - 34, row, { align: "right" });
      doc.text(INR(amount), right, row, { align: "right" });
      row += 4.8;
    });

    doc.line(X, row + 1, right, row + 1);

    doc.text("Total Tax:", right - 34, row + 5, { align: "right" });
    doc.text(INR(totals.totalGST), right, row + 5, { align: "right" });

    doc.line(X, row + 8, right, row + 8);

    doc.setTextColor(13, 102, 189);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.text("Grand Total:", right - 38, row + 13.5, { align: "right" });
    doc.text(INR(totals.total), right, row + 13.5, { align: "right" });

    // ---- Footer ----
    const foot = row + 20;
    doc.setDrawColor(210, 210, 210);
    doc.line(X, foot - 3, right, foot - 3);
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for shopping with us! | This is a computer-generated GST invoice.",
      X,
      foot
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Bank: ${BRAND.name}`, X, foot + 3.5);
    doc.text("A/c No: 123456789012 | IFSC: HDFCO0001234", X, foot + 7);

    doc.save("gst-invoice.pdf");
    setDownloading(false);
  };

  const formatItemTotal = (item) => item.price * item.qty;

  return (
    <section className="w-full max-w-5xl space-y-6">
      {/* Bill sample preview */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              GST Bill Sample
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date}</span>
          </div>
        </div>

        {/* Brand / Business header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30 text-2xl">
              {BRAND.logo}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {BRAND.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {BRAND.tagline}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              <span className="font-medium text-gray-900 dark:text-gray-200">
                GSTIN:
              </span>{" "}
              {BRAND.gstin}
            </p>
            <p className="text-gray-700 dark:text-gray-300">{BRAND.address}</p>
            <p className="text-gray-700 dark:text-gray-300">
              {BRAND.phone} | {BRAND.email}
            </p>
          </div>
        </div>

        {/* Invoice meta */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Invoice No.
            </p>
            <p className="text-gray-600 dark:text-gray-300">{billNo}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Date & Time</p>
            <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Calendar className="h-3.5 w-3.5" /> {date}
            </p>
            <p className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <Clock className="h-3.5 w-3.5" /> {time}
            </p>
          </div>
        </div>

        {/* Customer info */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <p className="mb-1 font-medium text-gray-900 dark:text-white">
            Customer / Bill To
          </p>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {CUSTOMER.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            GSTIN: {CUSTOMER.gstin}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {CUSTOMER.address}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Phone: {CUSTOMER.phone}
          </p>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto px-6 py-4">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="pb-2 text-left font-medium text-gray-900 dark:text-gray-200">
                  Item
                </th>
                <th className="pb-2 text-center font-medium text-gray-900 dark:text-gray-200">
                  Qty
                </th>
                <th className="pb-2 text-right font-medium text-gray-900 dark:text-gray-200">
                  Price
                </th>
                <th className="pb-2 text-center font-medium text-gray-900 dark:text-gray-200">
                  GST%
                </th>
                <th className="pb-2 text-right font-medium text-gray-900 dark:text-gray-200">
                  GST Amt
                </th>
                <th className="pb-2 text-right font-medium text-gray-900 dark:text-gray-200">
                  Total
                </th>
                <th className="pb-2 text-right font-medium text-gray-900 dark:text-gray-200">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No items in cart.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const gstAmt =
                    (item.price * item.qty * item.gst_rate) / 100;
                  const itemTotal = item.price * item.qty + gstAmt;
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-2 pr-2 text-gray-800 dark:text-gray-200">
                        {item.name}
                      </td>
                      <td className="py-2 text-center text-gray-600 dark:text-gray-300">
                        {item.qty}
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">
                        {INR(item.price)}
                      </td>
                      <td className="py-2 text-center text-gray-600 dark:text-gray-300">
                        {item.gst_rate}%
                      </td>
                      <td className="py-2 text-right text-gray-600 dark:text-gray-300">
                        {INR(gstAmt)}
                      </td>
                      <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                        {INR(itemTotal)}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-md p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Subtotal
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {INR(totals.subtotal)}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-1.5">
                <p className="mb-1 text-gray-600 dark:text-gray-300">
                  GST Breakdown
                </p>
                {Object.keys(totals.gstBreakdown).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No taxes.
                  </p>
                ) : (
                  Object.entries(totals.gstBreakdown).map(([rate, amt]) => (
                    <div
                      key={rate}
                      className="flex justify-between text-gray-600 dark:text-gray-300"
                    >
                      <span>GST {rate}%</span>
                      <span>{INR(amt)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Total GST
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {INR(totals.totalGST)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                    {INR(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
          Thank you for shopping with us! This is a computer-generated GST
          invoice. Terms &amp; Conditions apply.
        </div>
      </div>

      {/* Download button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {items.length} item(s) · Total:{" "}
          <span className="font-bold text-primary-700 dark:text-primary-400">
            {INR(totals.total)}
          </span>
        </p>
        <button
          type="button"
          onClick={downloadPDF}
          disabled={downloading || items.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? (
            <>
              <FileText className="h-4 w-4 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download GST Bill (PDF)
            </>
          )}
        </button>
      </div>
    </section>
  );
}
