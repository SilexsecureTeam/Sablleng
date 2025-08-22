import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import logo from "./assets/logo.png";

// Lazy imports for optimization
const HomePage = lazy(() => import("./Pages/HomePage"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const NotFound = lazy(() => import("./Components/NotFound"));

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        {/* Suspense fallback with logo loading animation */}
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
            <Route path="*" element={<NotFound />} /> {/* 404 Route */}
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
};

export default App;
