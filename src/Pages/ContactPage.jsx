import React from "react";
import Header from "../Components/Header";
import Noti from "../Components/Noti";
import Contact from "../Components/Contact";
import Footer from "../Components/Footer";
import Chero from "../Components/Chero";
import Trust from "../Components/Trust";

const ContactPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <Chero />
      <Trust />
      <Contact />
      <Footer />
    </div>
  );
};

export default ContactPage;
