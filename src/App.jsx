import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import "./App.css";
import logo from "./assets/logo.png";

const HomePage = lazy(() => import("./Pages/HomePage"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const NotFound = lazy(() => import("./Components/NotFound"));
const ProductPage = lazy(() => import("./Pages/ProductPage"));
const CartPage = lazy(() => import("./Pages/CartPage")); // New CartPage

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="relative">
        <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-indigo-500 border-r-purple-500 rounded-full animate-spin"></div>
        <div
          className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-cyan-400 border-l-blue-400 rounded-full animate-spin animation-delay-150"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-4 bg-white rounded-full shadow-2xl animate-pulse"></div>
          <img
            src={logo}
            alt="Loading..."
            className="relative w-16 h-16 object-contain animate-bounce z-10"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-ping transform -translate-x-1/2 -translate-y-2"></div>
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-ping transform -translate-x-1/2 translate-y-2 animation-delay-300"></div>
        <div className="absolute left-0 top-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping transform -translate-x-2 -translate-y-1/2 animation-delay-150"></div>
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping transform translate-x-2 -translate-y-1/2 animation-delay-450"></div>
      </div>
      <div className="absolute mt-48">
        <div className="flex items-center space-x-1">
          <span className="text-lg font-semibold text-gray-700">Loading</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce animation-delay-150"></div>
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce animation-delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
