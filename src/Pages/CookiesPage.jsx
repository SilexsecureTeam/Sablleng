import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import Cookies from "../Components/Cookies";
import Trust from "../Components/Trust";

const CookiesPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <Cookies />
      <Trust />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default CookiesPage;
