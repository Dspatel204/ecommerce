import React, { useEffect, useState } from "react";
import axios from "axios";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 16;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

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

  const fetchCategoryProducts = (category, pg = 1) => {
    setSelected(category);
    setPage(pg);
    loadProducts(category, pg);
  };

  const loadProducts = async (category, pg) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://dummyjson.com/products/category/${category}?limit=${PAGE_SIZE}&skip=${(pg - 1) * PAGE_SIZE}`
      );
      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected) loadProducts(selected, page);
  }, [page, selected]);

  const goBack = () => {
    setSelected(null);
    setProducts([]);
    setTotal(0);
    setPage(1);
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Categories
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {selected
            ? "Products in this category"
            : "Browse products by category."}
        </p>
      </div>

      {selected && (
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          ← Back to categories
        </button>
      )}

      {loading ? (
        <div className="space-y-3">
          {(selected ? products : categories).length === 0 &&
            Array.from({ length: selected ? 12 : 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
              />
            ))}
        </div>
      ) : selected ? (
        products.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No products in this category.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((item) => (
                <div key={item.id} className="card">
                  <img
                    src={item.thumbnail || item.images?.[0]}
                    alt={item.title}
                    className="mb-3 h-40 w-full rounded-md object-cover"
                  />
                  <h3 className="line-clamp-2 h-10 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.title}
                  </h3>
                  <p className="price">${item.price}</p>
                  <p className="mt-2 line-clamp-2 h-10 text-xs text-gray-600 dark:text-gray-300">
                    {item.category} · {item.discountPercentage
                      ? `${item.discountPercentage}% off`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
            <Pagination
              current={page}
              total={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => fetchCategoryProducts(cat)}
              className="card cursor-pointer text-left"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {cat}
              </span>
            </button>
          ))}
        </div>
      )}

      {!selected && !loading && categories.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          No categories available.
        </p>
      )}
    </section>
  );
}
