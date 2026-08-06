import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const navItems = [
  { name: "Home", to: "/" },
  { name: "Products", to: "/products" },
  { name: "Categories", to: "/categories" },
  { name: "QR Code", to: "/qr-code" },
  { name: "Checkout", to: "/checkout" },
  { name: "Billing", to: "/billing" },
];

export default function Header() {
  const { dark, toggle } = useTheme();
  const { cartCount, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-200" />
              )}
            </button>

            <Link to="/" className="group flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-secondary-500 text-white shadow-md shadow-primary-500/20 group-hover:scale-105 group-hover:shadow-primary-500/40 transition-all duration-300">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12 duration-300" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-gray-900 dark:text-white text-lg leading-tight flex items-center gap-1">
                  Product<span className="text-primary-600 dark:text-primary-400">Store</span>
                </span>
                <span className="text-[10px] font-medium tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                  Modern E-Commerce
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Actions (Theme Toggle & Cart Button) */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggle}
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {dark ? (
                <Sun className="h-5 w-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-600 to-secondary-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/40 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="hidden sm:inline">Cart</span>
              <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-extrabold transition-all duration-300 ${
                cartCount > 0 
                  ? "bg-amber-400 text-gray-950 animate-pulse shadow-sm" 
                  : "bg-white/20 text-white"
              }`}>
                {cartCount}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-primary-500" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
