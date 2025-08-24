import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.png";

const HomePage = lazy(() => import("./Pages/HomePage"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const NotFound = lazy(() => import("./Components/NotFound"));
const ProductPage = lazy(() => import("./Pages/ProductPage"));

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
              <img
                src={logo}
                alt="Loading..."
                className="w-24 h-24 animate-spin-slow"
              />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
};

export default App;