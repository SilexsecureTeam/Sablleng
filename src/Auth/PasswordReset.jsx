import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import auth from "../assets/auth1.png";
import logo from "../assets/logo.png";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL
  const email = searchParams.get("email"); // Extract email from URL
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }
    if (!token) {
      newErrors.api = "Invalid or missing reset token";
    }
    if (!email) {
      newErrors.api = "Invalid or missing email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://api.sablle.ng/api/password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email, // Include email in the request body
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();
      console.log(
        "PasswordReset: POST /api/password/reset response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        toast.success(data.message || "Password reset successfully!");
        setIsSuccess(true);
        setFormData({ password: "", password_confirmation: "" });
      } else {
        console.error("PasswordReset: Error:", data.message);
        toast.error(
          data.message || "Failed to reset password. Please try again."
        );
        setErrors({
          api: data.message || "An error occurred. Please try again.",
        });
      }
    } catch (error) {
      console.error("PasswordReset: Network error:", error.message);
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
          alt="Password reset background"
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
            Reset Password
          </h2>
          <p className="text-base text-[#141718] mb-6">
            {isSuccess
              ? "Your password has been reset successfully. You can now sign in with your new password."
              : "Enter your new password below to reset your account password."}
          </p>

          {errors.api && (
            <p className="text-red-500 text-sm mb-4">{errors.api}</p>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="w-full space-y-5">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CB5B6A] hover:text-[#CB5B6A]/80"
                  disabled={isLoading}
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

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  placeholder="Confirm New Password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CB5B6A] hover:text-[#CB5B6A]/80"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm">
                  {errors.password_confirmation}
                </p>
              )}

              <button
                type="submit"
                className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60 disabled:bg-[#141718]/50"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
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
                  ✓ Your password has been reset successfully.
                </p>
              </div>
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

export default PasswordReset;