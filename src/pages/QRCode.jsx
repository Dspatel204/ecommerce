import QRBarcodeScannerApp from "../features/counter/BillingApp";

export default function QRCode() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          QR / Barcode Scanner
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Scan a barcode or QR code to look up products and build a bill.
        </p>
      </div>
      <QRBarcodeScannerApp />
    </section>
  );
}
