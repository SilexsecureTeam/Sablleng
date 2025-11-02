import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Hero1 from "../Components/Hero1";
import Footer from "../Components/Footer";
import Create from "../Components/Create";
import Category1 from "../Components/Category1";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import Partners from "../Components/Partners";

const HomePage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <Hero1 />
      <Category1 />
      <Create />
      <Experince />
      <Discount />
      <Partners />
      <Footer />
    </div>
  );
};

export default HomePage;
