// src/components/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import auth from "../assets/auth2.png";
import logo from "../assets/logo.png";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usernameOrEmail.trim())
      newErrors.usernameOrEmail = "Username or email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate("/");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password clicked");
    // Implement forgot password logic here
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-poppins">
      {/* Left Side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-gray-100 items-center justify-center">
        <img
          src={auth}
          alt="Sign in background"
          className="w-full h-full object-cover min-h-[500px] max-h-[680px]"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center min-h-screen md:min-h-0 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md flex flex-col justify-center md:h-[600px]">
          {/* Logo */}
          <img src={logo} alt="Logo" className="mb-6 w-32 h-auto mx-auto" />

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 ">
            Sign In
          </h2>
          <p className="text-base text-[#141718] mb-6 ">
            Don’t have an account yet?{" "}
            <a href="/signup" className="text-[#CB5B6A] hover:underline">
              Sign Up
            </a>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <input
              type="text"
              name="usernameOrEmail"
              placeholder="Your username or email address"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
              required
            />
            {errors.usernameOrEmail && (
              <p className="text-red-500 text-sm">{errors.usernameOrEmail}</p>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CB5B6A] hover:text-[#CB5B6A]/80"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#CB5B6A] focus:ring-[#CB5B6A]/80 border-gray-300 rounded"
                />
                <label className="text-sm text-[#6C7275]">Remember me</label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#CB5B6A] text-sm hover:underline"
              >
                Forgot Password
              </button>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
