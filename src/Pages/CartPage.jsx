import React from "react";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import ShoppingCart from "../Components/ShoppingCart";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";
import Trust from "../Components/Trust";

const CartPage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <ShoppingCart />
      <Trust />
      <Experince />
      <Discount />
      <Footer />
    </div>
  );
};

export default CartPage;
