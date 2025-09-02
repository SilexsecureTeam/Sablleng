import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import FAQSection from "../Components/FAQSection";

const FaqPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <FAQSection />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default FaqPage;
