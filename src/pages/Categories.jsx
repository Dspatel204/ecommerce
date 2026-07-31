import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://dummyjson.com/products/category-list"
        );
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Browse products by category.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      ) : selected ? (
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-300">
            Showing category:{" "}
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {selected}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Back
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelected(cat)}
              className="card cursor-pointer text-left"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {cat}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
