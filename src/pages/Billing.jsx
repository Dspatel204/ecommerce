import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCodeLib from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode as QrCodeIcon } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const BRAND = {
  name: "ABC Electronics Store",
  tagline: "Your One Stop Tech Shop",
  gstin: "07AABCU9603R1ZM",
  address: "123 Business Street, Surat, Gujarat - 395003",
  phone: "+91 98765 43210",
  email: "contact@abcelectronics.com",
  logo: "🛒",
};

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
    const itemTotal = item.price * (item.quantity || 1);
    subtotal += itemTotal;
    const gstRate = 18;
    const gstAmount = (itemTotal * gstRate) / 100;
    totalGST += gstAmount;
    gstBreakdown[gstRate] = (gstBreakdown[gstRate] || 0) + gstAmount;
  });

  const total = subtotal + totalGST;
  return { subtotal, totalGST, total, gstBreakdown };
}

export default function Billing() {
  const { cartData, clearCart } = useCart();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const totals = calculateTotals(cartData);
  const billNo = `INV-${Date.now()}`;
  const date = new Date().toLocaleDateString("en-IN");
  const time = new Date().toLocaleTimeString("en-IN");

  const cartTotal = cartData.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const cartItemCount = cartData.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const billData = {
    billNo,
    date,
    time,
    items: cartData.map((item) => ({
      name: item.title,
      qty: item.quantity || 1,
      price: item.price,
      gstRate: 18,
    })),
    totals,
    cartTotal,
    cartItemCount,
  };

  const qrValue = JSON.stringify({
    billNo,
    date,
    total: cartTotal,
    items: cartData.map((i) => ({
      title: i.title,
      qty: i.quantity || 1,
      price: i.price,
    })),
  });

  const downloadPDF = async () => {
    if (cartData.length === 0) return;
    setDownloading(true);

    const doc = new jsPDF();
    const X = 14;
    const right = 196;

    // Branded header band
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

    // Biller and Customer
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
    doc.text("Checkout Customer", X, 66);
    doc.text("GSTIN: N/A (Test)", X, 68.5);

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

    // Totals block
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
    Object.entries(totals.gstBreakdown).forEach(([rate, amt]) => {
      doc.text(`GST ${rate}%:`, right - 34, row, { align: "right" });
      doc.text(INR(amt), right, row, { align: "right" });
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

    // QR Code
    const qrY = row + 18;
    doc.setFontSize(6.5);
    doc.setTextColor(90, 90, 90);
    doc.text("Bill QR Code:", X, qrY);
    const qrDataUrl = await QRCodeLib.toDataURL(qrValue, {
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
      "Thank you for shopping with us! | This is a computer-generated GST invoice.",
      X,
      foot
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Bank: ${BRAND.name}`, X, foot + 3.5);
    doc.text(
      "A/c No: 123456789012 | IFSC: HDFCO0001234",
      X,
      foot + 7
    );

    doc.save(`billing-${billNo}.pdf`);
    setDownloading(false);
  };

  if (cartData.length === 0) {
    return (
      <section className="py-20 text-center">
        <QrCodeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Your cart is empty
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Add some products before viewing the bill.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Billing
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Review your bill, scan the QR code, or download as PDF.
        </p>
      </div>

      {/* Bill Preview Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
        {/* Header */}
        <div className="bg-primary-700 dark:bg-primary-800 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-2xl">
              {BRAND.logo}
            </div>
            <div>
              <h2 className="text-xl font-bold">{BRAND.name}</h2>
              <p className="text-xs text-white/80">{BRAND.tagline}</p>
              <p className="text-xs text-white/80">GSTIN: {BRAND.gstin}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-lg font-bold">TAX INVOICE</p>
            <p className="text-xs text-white/90">{BRAND.address}</p>
            <p className="text-xs text-white/90">
              {BRAND.phone} | {BRAND.email}
            </p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-sm">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Invoice No.
            </p>
            <p className="text-gray-600 dark:text-gray-300">{billNo}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Date & Time
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {date} — {time}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto px-6 py-4">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-primary-700 dark:bg-primary-800 text-white">
                <th className="py-2 pr-2 text-center text-xs font-medium">
                  S.No
                </th>
                <th className="py-2 text-left text-xs font-medium">Item</th>
                <th className="py-2 text-center text-xs font-medium">Qty</th>
                <th className="py-2 text-right text-xs font-medium">Price</th>
                <th className="py-2 text-center text-xs font-medium">GST%</th>
                <th className="py-2 text-right text-xs font-medium">GST Amt</th>
                <th className="py-2 text-right text-xs font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartData.map((item, i) => {
                const qty = item.quantity || 1;
                const gstAmt = (item.price * qty * 18) / 100;
                const itemTotal = item.price * qty + gstAmt;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-2 text-center text-gray-800 dark:text-gray-200">
                      {i + 1}
                    </td>
                    <td className="py-2 pr-2 text-gray-800 dark:text-gray-200">
                      {item.title}
                    </td>
                    <td className="py-2 text-center text-gray-600 dark:text-gray-300">
                      {qty}
                    </td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-300">
                      {INR(item.price)}
                    </td>
                    <td className="py-2 text-center text-gray-600 dark:text-gray-300">
                      18%
                    </td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-300">
                      {INR(gstAmt)}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                      {INR(itemTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Subtotal ({cartItemCount} items)
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {INR(totals.subtotal)}
                </span>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-1.5">
                <p className="mb-1 text-gray-600 dark:text-gray-300">
                  GST Breakdown
                </p>
                {Object.entries(totals.gstBreakdown).map(([rate, amt]) => (
                  <div
                    key={rate}
                    className="flex justify-between text-gray-600 dark:text-gray-300"
                  >
                    <span>GST {rate}%</span>
                    <span>{INR(amt)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Total GST
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {INR(totals.totalGST)}
                </span>
              </div>

              <div className="border-t-2 border-primary-700 dark:border-primary-400 pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Grand Total
                  </span>
                  <span className="text-xl font-bold text-primary-700 dark:text-primary-400">
                    {INR(totals.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code + Download */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <QRCodeCanvas value={qrValue} size={64} level="M" />
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">
                Scan QR to verify bill
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                {billNo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={downloadPDF}
            disabled={downloading || cartData.length === 0}
            className="inline-flex items-center gap-2 rounded-md bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <>
                <QrCodeIcon className="h-4 w-4 animate-pulse" />
                Generating PDF...
              </>
            ) : (
              <>
                <QrCodeIcon className="h-4 w-4" />
                Download Bill (PDF)
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}