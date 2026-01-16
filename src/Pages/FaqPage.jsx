import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import FAQSection from "../Components/FAQSection";
import Trust from "../Components/Trust";

const FaqPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <FAQSection />
      <Trust />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default FaqPage;
