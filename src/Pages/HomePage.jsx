import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Hero from "../Components/Hero";
import SabileLanding from "../Components/SabileLanding";
import Features from "../Components/Features";
import PromoSection from "../Components/PromoSection";
import Trust from "../Components/Trust";
import Gift from "../Components/Gift";
import Choose from "../Components/Choose";
import NumberComponent from "../Components/NumberComponent";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import Footer from "../Components/Footer";

const HomePage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <Hero />
      <SabileLanding />
      <Features />
      <PromoSection />
      <Trust />
      <Gift />
      <Choose />
      <NumberComponent />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default HomePage;
