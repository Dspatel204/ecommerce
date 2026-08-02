import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Modal } from "@mui/material";
import Slider from "react-slick";
import { ShoppingCart, Plus, Check, Zap, Loader2, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { payWithRazorpay } from "../../utils/razorpay";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 16;

export default function Cart() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Track button feedback states per item
  const [addedItemIds, setAddedItemIds] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const {
    cartData,
    addToCart,
    removeFromCart,
    isCartOpen,
    closeCart,
    toggleCart,
  } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${
            (page - 1) * PAGE_SIZE
          }`
        );
        setProducts(response.data.products || []);
        setTotal(response.data.total || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  const handleAddToCart = (item) => {
    addToCart(item);
    // Show temporary 'Added ✓' state animation for 1.5 seconds
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const handleBuyNow = async (item) => {
    setProcessingId(item.id);
    try {
      await payWithRazorpay({
        amount: item.price,
        currency: "INR",
        prefill: {},
        onSuccess: () => {
          alert("Payment successful!");
          addToCart(item);
        },
      });
    } catch (err) {
      alert(err?.message || "Payment could not be initiated.");
    } finally {
      setProcessingId(null);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="w-full space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary-900/10 via-primary-600/5 to-secondary-900/10 p-6 rounded-3xl border border-primary-500/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Featured Products
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Browse high quality items with instant Razorpay checkout & fast delivery.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleCart}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/35 hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <ShoppingCart className="h-4 w-4 transition-transform group-hover:-rotate-12" />
          <span>View Cart</span>
          <span className="ml-1 rounded-full bg-amber-400 text-gray-950 font-bold px-2 py-0.5 text-xs animate-pulse">
            {cartData.length}
          </span>
        </button>
      </div>

      {/* Product List / Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded-xl w-full" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              </div>
              <div className="h-9 bg-gray-300 dark:bg-gray-700 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => {
            const isAdded = addedItemIds[item.id];
            const isProcessing = processingId === item.id;

            return (
              <div
                key={item.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-primary-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Container with Zoom effect */}
                <div className="relative mb-3 h-44 w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Rating Tag */}
                  {item.rating && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-300">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                      <span>{item.rating}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="line-clamp-1 text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
                    {item.description}
                  </p>
                  <div className="pt-2 flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                      ${item.price}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      In Stock
                    </span>
                  </div>
                </div>

                {/* Animated Action Buttons Grid */}
                <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {/* Add to Cart Button with Animated Feedback */}
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className={`relative flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${
                      isAdded
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25 animate-pop"
                        : "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 border border-primary-200 dark:border-primary-800/60 shadow-sm"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 animate-bounce" />
                        <span>Added!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-300" />
                        <span>Add Cart</span>
                      </>
                    )}
                  </button>

                  {/* Buy Now Button with Gradient & Loader */}
                  <button
                    type="button"
                    onClick={() => handleBuyNow(item)}
                    disabled={isProcessing}
                    className="relative flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/35 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Paying...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5 fill-current text-amber-200" />
                        <span>Buy Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        current={page}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Cart Modal */}
      <Modal
        open={isCartOpen}
        onClose={closeCart}
        aria-labelledby="cart-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            outline: "none",
            p: 0,
            borderRadius: 3,
          }}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800"
        >
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <h2
              id="cart-modal-title"
              className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span>Cart Items ({cartData.length})</span>
            </h2>
            <button
              onClick={closeCart}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {cartData.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400 space-y-3">
                <ShoppingCart className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700" />
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <Slider {...sliderSettings}>
                {cartData.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 text-center border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 mx-1"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-24 w-full rounded-lg object-cover mb-3"
                    />
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-accent-500 font-extrabold text-base mt-1">
                      ${item.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="mt-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-3 py-1.5 text-xs font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </Slider>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total items: {cartData.length}
            </span>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
