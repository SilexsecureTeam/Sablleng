import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import PaymentComponent from "../Components/PaymentComponent";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";

const PaymentPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <PaymentComponent />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default PaymentPage;
