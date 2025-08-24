import React from "react";
import { useParams } from "react-router-dom";
import Noti from "../Components/Noti";
import Header from "../Components/Header";
import Phero from "../Components/Phero";
import Product from "../Components/Product";
import ProductDetail from "../Components/ProductDetail"; // New component
import Footer from "../Components/Footer";

const ProductPage = () => {
  const { id } = useParams(); // Get product ID from URL

  return (
    <div>
      <Noti />
      <Header />
      {id ? <ProductDetail id={id} /> :
      <div>
        <Phero />
      <Product />
      </div>}
      <Footer />
    </div>
  );
};

export default ProductPage;