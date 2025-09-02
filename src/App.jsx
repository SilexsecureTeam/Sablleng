import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import "./App.css";
import logo from "./assets/logo.png";

const HomePage = lazy(() => import("./Pages/HomePage"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const NotFound = lazy(() => import("./Components/NotFound"));
const ProductPage = lazy(() => import("./Pages/ProductPage"));
const CategoryPage = lazy(() => import("./Pages/CategoryPage"));
const ContactPage = lazy(() => import("./Pages/ContactPage"));
const CartPage = lazy(() => import("./Pages/CartPage"));
const DeliveryPage = lazy(() => import("./Pages/DeliveryPage"));
const PaymentPage = lazy(() => import("./Pages/PaymentPage"));
const PrivacyPage = lazy(() => import("./Pages/PrivacyPage"));
const TermsPage = lazy(() => import("./Pages/TermsPage"));
const CookiesPage = lazy(() => import("./Pages/CookiesPage"));
const CareerPage = lazy(() => import("./Pages/CareerPage"));
const FaqPage = lazy(() => import("./Pages/FaqPage"));
const OrderSuccess = lazy(() => import("./Components/OrderSuccess"));
const OrderTracking = lazy(() => import("./Components/OrderTracking"));
const SignIn = lazy(() => import("./Auth/SignIn"));
const SignUp = lazy(() => import("./Auth/SignUp"));
const OtpPage = lazy(() => import("./Auth/OTP"));
// const CustomizablePage = lazy(() => import("./Pages/CustomizablePage"));
const CustomizablePage = lazy(() => import("./Pages/Customizable"));

const LoadingSpinner = () => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#CB5B6A]/10 via-white to-[#CB5B6A]/10 animate-fade-in"
      aria-label="Loading content"
    >
      <div className="relative">
        <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-[#CB5B6A] border-r-[#E07B8A] rounded-full animate-spin"></div>
        <div
          className="absolute inset-2 w-28 h-28 border-4 border-transparent border-t-[#A84957] border-l-[#CB5B6A] rounded-full animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-4 bg-white rounded-full shadow-2xl animate-pulse"></div>
          <img
            src={logo}
            alt="Sabilay logo"
            className="relative w-16 h-16 object-contain animate-bounce z-10"
            style={{ animationDuration: "2s" }}
          />
        </div>
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#CB5B6A] rounded-full animate-ping transform -translate-x-1/2 -translate-y-2"></div>
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-[#E07B8A] rounded-full animate-ping transform -translate-x-1/2 translate-y-2 animation-delay-300"></div>
        <div className="absolute left-0 top-1/2 w-2 h-2 bg-[#A84957] rounded-full animate-ping transform -translate-x-2 -translate-y-1/2 animation-delay-150"></div>
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-[#CB5B6A] rounded-full animate-ping transform translate-x-2 -translate-y-1/2 animation-delay-450"></div>
      </div>
      <div className="absolute mt-48">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-[#CB5B6A]">Loading</span>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-[#CB5B6A] rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-[#E07B8A] rounded-full animate-bounce animation-delay-150"></div>
            <div className="w-1.5 h-1.5 bg-[#A84957] rounded-full animate-bounce animation-delay-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
              <Route
                path="/categories/:categorySlug"
                element={<CategoryPage />}
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/otp" element={<OtpPage />} />
              <Route path="/customize" element={<CustomizablePage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookie-policy" element={<CookiesPage />} />
              <Route path="/privacy-policy" element={<PrivacyPage />} />
              <Route path="/careers" element={<CareerPage />} />
              <Route path="/faqs" element={<FaqPage />} />
              {/* Add this route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
