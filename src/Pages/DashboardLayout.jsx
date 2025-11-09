// src/Components/Dashboard/DashboardLayout.jsx
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
const DeliveryFeeManager = lazy(() =>
  import("../Components/Dashboard/DeliveryFeeManager")
);
const Customization = lazy(() =>
  import("../Components/Dashboard/Customization")
);
const TaxManagement = lazy(() =>
  import("../Components/Dashboard/TaxManagement")
);
const BrandList = lazy(() => import("../Components/Dashboard/BrandList"));
const ProductList = lazy(() => import("../Components/Dashboard/ProductList"));
const ProductReviews = lazy(() =>
  import("../Components/Dashboard/ProductReviews")
);
const EditSupplierForm = lazy(() =>
  import("../Components/Dashboard/EditSupplierForm")
);
const SupplierList = lazy(() => import("../Components/Dashboard/SupplierList"));
const Settings = lazy(() => import("../Components/Dashboard/Settings"));
const AdminRole = lazy(() => import("../Components/Dashboard/AdminRole"));
const ProductView = lazy(() => import("../Components/Dashboard/ProductView"));
const Sidebar = lazy(() => import("../Components/Dashboard/Sidebar"));
const CategoryProducts = lazy(() =>
  import("../Components/Dashboard/CategoryProducts")
);
const OrderDetails = lazy(() => import("../Components/Dashboard/OrderDetails"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-[#5F1327] font-semibold">Loading...</div>
  </div>
);

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="flex min-h-screen font-poppins bg-gray-100">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 md:ml-64">
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
                path="/orders/:reference/details"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <OrderDetails />
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
                path="/categories/:id/products"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <CategoryProducts />
                  </MainContent>
                }
              />
              <Route
                path="/delivery-fee-manager"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <DeliveryFeeManager />
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
                path="/tax-management"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <TaxManagement />
                  </MainContent>
                }
              />
              <Route
                path="/brand"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <BrandList />
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
                path="/product/:id"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <ProductView />
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
                path="/suppliers"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <SupplierList />
                  </MainContent>
                }
              />
              <Route
                path="/suppliers/:id/edit"
                element={
                  <MainContent toggleSidebar={toggleSidebar}>
                    <EditSupplierForm />
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
          </main>
        </div>
      </div>
    </Suspense>
  );
};

export default DashboardLayout;
