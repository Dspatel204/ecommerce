import "./styles.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Outlet, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import QRCode from "./pages/QRCode";
import Checkout from "./pages/Checkout";

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="qr-code" element={<QRCode />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
