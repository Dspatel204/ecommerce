import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Welcome to the Product Store
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover the best products, scan QR/barcode orders, and manage your
          cart — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/products"
          className="group flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="rounded-lg bg-primary-100 dark:bg-primary-900/30 p-3">
            <ShoppingCart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            Browse Products
          </span>
        </Link>
        <Link
          to="/qr-code"
          className="group flex flex-col items-center gap-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="rounded-lg bg-secondary-100 dark:bg-secondary-900/30 p-3">
            <svg
              className="h-6 w-6 text-secondary-600 dark:text-secondary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m0 14v1m8.66-9.66l-.7.7a8 8 0 00-10.92 0l-.7-.7A9 9 0 1112 21a9 9 0 018.66-6.66z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-secondary-600 dark:group-hover:text-secondary-400">
            Scan QR / Barcode
          </span>
        </Link>
      </div>
    </section>
  );
}
