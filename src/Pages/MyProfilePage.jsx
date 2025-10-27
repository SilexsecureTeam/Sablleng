import React from "react";
import MyProfile from "../Components/MyProfile";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Noti from "../Components/Noti";

const MyProfilePage = () => {
  return (
    <div>
      <Noti />
      <Header />
      <MyProfile />
      <Footer />
    </div>
  );
};

export default MyProfilePage;
