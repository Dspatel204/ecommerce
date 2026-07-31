import { NavLink, Link } from "react-router-dom";
import { ShoppingCart, Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";

const navItems = [
  { name: "Home", to: "/" },
  { name: "Products", to: "/products" },
  { name: "Categories", to: "/categories" },
  { name: "QR Code", to: "/qr-code" },
];

const activeClass =
  "text-primary-600 dark:text-primary-400";
const inactiveClass =
  "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400";

export default function Header() {
  const { dark, toggle } = useTheme();
  const { cartCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="hidden font-bold text-gray-900 dark:text-white sm:inline text-xl">
                Product Store
              </span>
              <span className="font-bold text-gray-900 dark:text-white sm:hidden text-lg">
                Store
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex md:items-center md:gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? activeClass : inactiveClass
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
