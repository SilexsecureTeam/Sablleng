import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link for logo
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import auth from "../assets/auth1.png";
import logo from "../assets/logo.png";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    agree: false,
    newsletter: false, // Added for newsletter enrollment
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{11}$/.test(formData.mobile))
      newErrors.mobile = "Mobile number must be 11 digits";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agree)
      newErrors.agree = "You must agree to the Privacy Policy and Terms of Use";
    // Newsletter is optional, so no validation error
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Optionally, handle newsletter enrollment (e.g., log or send to backend)
      console.log("Newsletter enrollment:", formData.newsletter);
      navigate("/otp");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen h-fit flex flex-col md:flex-row font-poppins items-stretch">
      {/* Left Side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-gray-100">
        <img
          src={auth}
          alt="Contact form background"
          className="w-full h-full min-h-screen object-cover"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-md">
          {/* Logo - Clickable to Home */}
          <Link to="/">
            <img
              src={logo}
              alt="Brand Logo"
              className="mb-6 w-32 h-auto mx-auto cursor-pointer"
            />
          </Link>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 text-left">
            Sign Up
          </h2>
          <p className="text-base text-[#141718] mb-4 text-left">
            Already have an account?{" "}
            <a href="/signin" className="text-[#CB5B6A] hover:underline">
              Sign in
            </a>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-2">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
              required
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username}</p>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile No"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
              required
            />
            {errors.mobile && (
              <p className="text-red-500 text-sm">{errors.mobile}</p>
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-sm border-b focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#CB5B6A] hover:text-[#CB5B6A]/80"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}

            <div className="flex items-center space-x-2 py-3 mb-0">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="h-4 w-4 text-[#CB5B6A] focus:ring-[#CB5B6A]/80 border-gray-300 rounded"
                required
              />
              <label className="text-sm text-[#6C7275]">
                I agree with{" "}
                <a
                  href="/privacy"
                  className="text-[#141718] font-semibold hover:underline"
                >
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  className="text-[#141718] font-semibold hover:underline"
                >
                  Terms of Use
                </a>
              </label>
            </div>
            {errors.agree && (
              <p className="text-red-500 text-sm">{errors.agree}</p>
            )}

            <div className="flex items-center mb-0 space-x-2 py-3">
              <input
                type="checkbox"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleChange}
                className="h-4 w-4 text-[#CB5B6A] focus:ring-[#CB5B6A]/80 border-gray-300 rounded"
              />
              <label className="text-sm text-[#6C7275]">
                Subscribe to newsletters, exclusive offers, and promotions
              </label>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
