import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Footer from "../Components/Footer";
import CustomizableProducts from "../Components/CustomizableProducts";

const CustomizablePage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <Phero />
      <CustomizableProducts />
      <Footer />
    </div>
  );
};

export default CustomizablePage;
