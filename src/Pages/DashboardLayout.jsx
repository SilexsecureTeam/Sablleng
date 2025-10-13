// src/Pages/DashboardLayout.jsx
import React, { useState, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainContent from "../Components/Dashboard/MainContent";
import "../global.css";
import { lazy } from "react";

// Lazy-loaded components
const DashboardHome = lazy(() =>
  import("../Components/Dashboard/DashboardHome")
);
const OrderManagement = lazy(() =>
  import("../Components/Dashboard/OrderManagement")
);
const Customers = lazy(() => import("../Components/Dashboard/Customers"));
const CouponCode = lazy(() => import("../Components/Dashboard/CouponCode"));
const Categories = lazy(() => import("../Components/Dashboard/Categories"));
const Transaction = lazy(() => import("../Components/Dashboard/Transaction"));
const Customization = lazy(() =>
  import("../Components/Dashboard/Customization")
);
const AddProducts = lazy(() => import("../Components/Dashboard/AddProducts"));
const Inventory = lazy(() => import("../Components/Dashboard/Inventory"));
const ProductList = lazy(() => import("../Components/Dashboard/ProductList"));
const ProductReviews = lazy(() =>
  import("../Components/Dashboard/ProductReviews")
);
const Report = lazy(() => import("../Components/Dashboard/Report"));
const Settings = lazy(() => import("../Components/Dashboard/Settings"));
const AdminRole = lazy(() => import("../Components/Dashboard/AdminRole"));
const Sidebar = lazy(() => import("../Components/Dashboard/Sidebar"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-[#CB5B6A] font-semibold">Loading...</div>
  </div>
);

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen font-poppins bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 md:ml-64">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route
                path="/"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <DashboardHome />
                  </MainContent>
                }
              />
              <Route
                path="/orders"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <OrderManagement />
                  </MainContent>
                }
              />
              <Route
                path="/customers"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Customers />
                  </MainContent>
                }
              />
              <Route
                path="/coupon-code"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <CouponCode />
                  </MainContent>
                }
              />
              <Route
                path="/categories"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Categories />
                  </MainContent>
                }
              />
              <Route
                path="/transaction"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Transaction />
                  </MainContent>
                }
              />
              <Route
                path="/customization"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Customization />
                  </MainContent>
                }
              />
              <Route
                path="/add-products"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <AddProducts />
                  </MainContent>
                }
              />
              <Route
                path="/inventories"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Inventory />
                  </MainContent>
                }
              />
              <Route
                path="/product-list"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <ProductList />
                  </MainContent>
                }
              />
              <Route
                path="/product-reviews"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <ProductReviews />
                  </MainContent>
                }
              />
              <Route
                path="/report"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Report />
                  </MainContent>
                }
              />
              <Route
                path="/settings"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <Settings />
                  </MainContent>
                }
              />
              <Route
                path="/admin-role"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <AdminRole />
                  </MainContent>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
