import { FileText } from "lucide-react";
import GSTBillSample from "../components/GSTBillSample";

export default function QRCode() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          GST Bill
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review the full GST bill sample (brand name + business &amp; customer
          details, item table, GST breakdown, totals) and download it as a PDF.
        </p>
      </div>

      <GSTBillSample />
    </section>
  );
}
