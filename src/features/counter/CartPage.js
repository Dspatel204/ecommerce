import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Modal } from "@mui/material";
import Slider from "react-slick";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const [allProducts, setAllProducts] = useState([]);
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
      try {
        const response = await axios.get("https://dummyjson.com/products");
        setAllProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Product Store
        </h1>
        <button
          type="button"
          onClick={toggleCart}
          className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          View Cart ({cartData.length})
        </button>
      </div>

      {allProducts.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {allProducts.map((item) => (
            <div key={item.id} className="card">
              <img
                src={item.images[0]}
                alt={item.title}
                className="mb-3 h-40 w-full rounded-md object-cover"
              />
              <h3 className="line-clamp-2 h-10 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </h3>
              <p className="price">${item.price}</p>
              <p className="mt-2 line-clamp-2 h-10 text-xs text-gray-600 dark:text-gray-300">
                {item.description.slice(0, 50)}...
              </p>
              <button type="button" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

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
            borderRadius: 2,
          }}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-2xl outline-none"
        >
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2
              id="cart-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Cart Items
            </h2>
          </div>

          <div className="p-6">
            {cartData.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No items in cart.
              </p>
            ) : (
              <Slider {...sliderSettings}>
                {cartData.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg mx-1"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="h-20 w-full rounded-md object-cover mb-2"
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.title}
                    </p>
                    <p className="text-accent-500 dark:text-accent-400 font-bold">
                      ${item.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </Slider>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-right">
            <button
              type="button"
              onClick={closeCart}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Close
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
