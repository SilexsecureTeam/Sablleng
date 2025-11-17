// src/Auth/SignIn.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContextObject";
import { CartContext } from "../context/CartContextObject";
import auth from "../assets/auth1.png";
import logo from "../assets/logo.png";
import GoogleButton from "../Components/GoogleButton";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { cart_session_id, setCartSessionId, setItems, setTotal } =
    useContext(CartContext);
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
      const response = await fetch("https://api.sablle.ng/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log(
        "SignIn: POST /api/login response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        const role = data.user?.role || "user";
        console.log("SignIn: Login successful with details:", {
          token: data.token?.substring(0, 20) + "...", // Truncate for readability
          user: data.user,
          role: role,
        });
        if (role.toLowerCase() !== "user") {
          toast.error("Access denied. Please use the admin login page.");
          setErrors({
            ...errors,
            api: "Access denied. Please use the admin login page.",
          });
          setIsLoading(false);
          return;
        }
        toast.success("Login successful! Redirecting...");
        login(data.token, data.user, role);

        if (cart_session_id) {
          try {
            const mergeResponse = await fetch(
              "https://api.sablle.ng/api/cart/merge",
              {
                method: "POST",
                headers: {
                  "X-Cart-Session": cart_session_id,
                  Authorization: `Bearer ${data.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              }
            );
            const mergeData = await mergeResponse.json();
            console.log(
              "SignIn: POST /api/cart/merge response:",
              JSON.stringify(mergeData, null, 2)
            );

            if (mergeResponse.ok) {
              toast.success("Guest cart merged successfully");
              setCartSessionId(null);
              localStorage.removeItem("cart_session_id");
              localStorage.setItem(
                "cart_items",
                JSON.stringify(mergeData.data?.items || [])
              );
              localStorage.setItem("cart_total", mergeData.data?.total || 0);
            } else {
              toast.error(mergeData.message || "Failed to merge cart");
            }
          } catch (error) {
            console.error("SignIn: Merge cart error:", error.message);
          }
        }

        try {
          const cartResponse = await fetch("https://api.sablle.ng/api/cart", {
            method: "GET",
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const cartData = await cartResponse.json();
          console.log(
            "SignIn: GET /api/cart after login response:",
            JSON.stringify(cartData, null, 2)
          );
          console.log("SignIn: Items to set:", cartData.data?.items || []);

          if (cartResponse.ok) {
            setItems(cartData.data?.items || []);
            setTotal(cartData.data?.total || 0);
            localStorage.setItem(
              "cart_items",
              JSON.stringify(cartData.data?.items || [])
            );
            localStorage.setItem("cart_total", cartData.data?.total || 0);
            console.log(
              "SignIn: Updated items state:",
              cartData.data?.items || []
            );
            toast.success("Cart updated successfully");
          } else {
            toast.error(cartData.message || "Failed to fetch cart");
            const cachedItems = JSON.parse(
              localStorage.getItem("cart_items") || "[]"
            );
            const cachedTotal = parseFloat(
              localStorage.getItem("cart_total") || "0"
            );
            setItems(cachedItems);
            setTotal(cachedTotal);
          }
        } catch (error) {
          console.error("SignIn: Fetch cart error:", error.message);
          toast.error("Network error while fetching cart");
          const cachedItems = JSON.parse(
            localStorage.getItem("cart_items") || "[]"
          );
          const cachedTotal = parseFloat(
            localStorage.getItem("cart_total") || "0"
          );
          setItems(cachedItems);
          setTotal(cachedTotal);
        }

        const fromPath = location.state?.from?.pathname || "/";
        const finalPath =
          role.toLowerCase() === "admin" ? "/dashboard" : fromPath;
        console.log("SignIn: Redirecting to:", finalPath);

        setTimeout(() => {
          navigate(finalPath, { replace: true });
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
        api: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password clicked");
    navigate("/forgot-password");
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
            Sign In
          </h2>
          <p className="text-base text-[#141718] mb-6">
            Don’t have an account yet?{" "}
            <a href="/signup" className="text-[#5F1327] hover:underline">
              Sign Up
            </a>
          </p>
          {/* {errors.api && (
            <p className="text-red-500 text-sm mb-4">{errors.api}</p>
          )} */}
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
                  className="h-4 w-4 accent-[#5F1327] focus:ring-[#5F1327]/80 border-gray-300 rounded"
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
          <GoogleButton />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
