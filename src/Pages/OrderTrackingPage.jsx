import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import OrderTracking from "../Components/OrderTracking";
import Noti from "../Components/Noti";

const OrderTrackingPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <OrderTracking />
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
