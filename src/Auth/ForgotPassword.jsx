// src/Auth/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../assets/auth1.png";
import logo from "../assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        "https://api.sablle.ng/api/password/forgot",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      console.log(
        "ForgotPassword: POST /api/password/forgot response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        toast.success(
          data.message || "Password reset link sent! Check your email."
        );
        setIsSuccess(true);
        setEmail("");
      } else {
        console.error("ForgotPassword: Error:", data.message);
        toast.error(
          data.message ||
            "Failed to send reset link. Please check your email and try again."
        );
        setErrors({
          api: data.message || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("ForgotPassword: Network error:", error.message);
      toast.error("Network error. Please check your connection and try again.");
      setErrors({
        api: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen h-fit flex flex-col md:flex-row font-poppins items-stretch">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
      <div className="hidden md:flex md:w-1/2 bg-gray-100">
        <img
          src={auth}
          alt="Forgot password background"
          className="w-full h-full object-fill"
          loading="lazy"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link className="cursor-pointer" to="/">
            <img src={logo} alt="Logo" className="mb-6 w-32 h-auto mx-auto" />
          </Link>
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2">
            Forgot Password?
          </h2>
          <p className="text-base text-[#141718] mb-6">
            {isSuccess
              ? "We've sent you a password reset link. Please check your email."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>

          {errors.api && (
            <p className="text-red-500 text-sm mb-4">{errors.api}</p>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60 disabled:bg-[#141718]/50"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center mt-4">
                <Link
                  to="/signin"
                  className="text-[#CB5B6A] text-sm hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 text-sm">
                  ✓ If an account exists with this email, you will receive a
                  password reset link shortly.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="w-full p-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60"
              >
                Send Another Link
              </button>

              <div className="text-center">
                <Link
                  to="/signin"
                  className="text-[#CB5B6A] text-sm hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
