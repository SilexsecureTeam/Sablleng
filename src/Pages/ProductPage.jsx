import React from "react";
import { useParams } from "react-router-dom";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Product from "../Components/Product";
import ProductDetail from "../Components/ProductDetail";
import Footer from "../Components/Footer";
import Experince from "../Components/Experince";
import Discount from "../Components/Discount";

const ProductPage = () => {
  const { id } = useParams(); // Get product ID from URL

  return (
    <div>
      <Noti />
      <Header />
      {id ? (
        <div>
          {" "}
          <ProductDetail id={id} />
          <Experince />
          <Discount />
        </div>
      ) : (
        <div>
          <Phero />
          <Product />
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductPage;
