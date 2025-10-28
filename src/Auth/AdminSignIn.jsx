import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContextObject";
import auth from "../assets/auth3.png";
import logo from "../assets/logo.png";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("https://api.sablle.ng/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log(
        "SignIn: POST /api/admin/login response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        toast.success("OTP sent to your email. Please verify.");
        // Store user data without token, as token comes after OTP
        login(null, data.data, "admin");
        setTimeout(() => {
          navigate("/admin/otp");
        }, 2000);
      } else {
        console.error("SignIn: Login error:", data.message);
        toast.error(
          data.message || "Login failed. Please check your credentials."
        );
        setErrors({
          ...errors,
          api: data.message || "An error occurred during login.",
        });
      }
    } catch (error) {
      console.error("SignIn: Network error:", error.message);
      toast.error("Network error. Please check your connection and try again.");
      setErrors({
        ...errors,
        api: error.message || "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password clicked");
    // Implement forgot password logic here
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
          alt="Sign in background"
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
            Admin Sign In
          </h2>
          {errors.api && (
            <p className="text-red-500 text-sm mb-4">{errors.api}</p>
          )}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#5F1327]"
              required
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#5F1327]"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5F1327] hover:text-[#5F1327]/80"
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
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#5F1327] focus:ring-[#5F1327]/80 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label className="text-sm text-[#6C7275]">Remember me</label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#5F1327] text-sm hover:underline"
                disabled={isLoading}
              >
                Forgotten Password
              </button>
            </div>
            <button
              type="submit"
              className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#5F1327]/60 disabled:bg-[#141718]/50"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
