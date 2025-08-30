import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import DeliveryDetails from "../Components/DeliveryDetails";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";

const DeliveryPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <DeliveryDetails />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default DeliveryPage;
