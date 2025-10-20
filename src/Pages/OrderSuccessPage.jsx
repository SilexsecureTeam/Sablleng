import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import OrderSuccess from "../Components/OrderSuccess";
import Footer from "../Components/Footer";

const OrderSuccessPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <OrderSuccess />
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
