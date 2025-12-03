import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContextObject";
import auth3 from "../assets/auth3.png";
import logo from "../assets/logo.png";

const AdminOtpPage = () => {
  const navigate = useNavigate();
  const { auth, login } = useContext(AuthContext);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setCanResend(true);
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (otp.some((digit) => digit === "")) {
      newErrors.otp = "All OTP digits are required";
    } else if (!otp.every((digit) => /^[0-9]$/.test(digit))) {
      newErrors.otp = "OTP must contain only digits";
    }
    if (!auth.user?.email) {
      newErrors.api = "User email is missing. Please log in again.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.api) {
        toast.error(errors.api);
        navigate("/admin/signin");
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.sablle.ng/api/admin/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otp: otp.join(""),
            email: auth.user.email,
          }),
        }
      );

      const data = await response.json();
      console.log(
        "OTP: POST /api/admin/verify-otp response:",
        JSON.stringify(data, null, 2)
      );

      if (response.ok) {
        login(data.token, data.user);
        localStorage.setItem("otp_verified", "true");
        toast.success("Verification successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        console.error("OTP: Verification error:", data.message);
        toast.error(data.message || "Verification failed. Please try again.");
        setErrors({
          ...errors,
          api: data.message || "An error occurred during verification.",
        });
      }
    } catch (error) {
      console.error("OTP: Network error:", error.message);
      toast.error("Network error. Please check your connection and try again.");
      setErrors({
        ...errors,
        api: "Network error. Please check your connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!auth.user?.email) {
      toast.error("User email is missing. Please log in again.");
      navigate("/admin/signin");
      return;
    }

    setIsLoading(true);
    setCanResend(false);
    setCountdown(60);

    try {
      const response = await fetch(
        "https://api.sablle.ng/api/admin/otp/resend",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: auth.user.email,
          }),
        }
      );

      const data = await response.json();
      // console.log(
      //   "OTP: POST /api/admin/resend-otp response:",
      //   JSON.stringify(data, null, 2)
      // );

      if (response.ok) {
        toast.success("New OTP sent to your email!");
      } else {
        console.error("OTP: Resend error:", data.message);
        toast.error(data.message || "Failed to resend OTP. Please try again.");
        setCanResend(true);
      }
    } catch (error) {
      console.error("OTP: Resend network error:", error.message);
      toast.error("Network error while resending OTP.");
      setCanResend(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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
          src={auth3}
          alt="OTP verification background"
          className="w-full h-full object-fill"
          loading="lazy"
        />
      </div>
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <img src={logo} alt="Logo" className="mb-16 w-32 h-auto mx-auto" />
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 text-center md:text-start">
            Verify Your Account
          </h2>
          <p className="text-base text-[#6C7275] mb-6 text-center md:text-start">
            We’ve sent a 4-digit verification code to your registered email
            address or phone number. Please enter it below to complete your
            sign-up.
          </p>
          {errors.api && (
            <p className="text-red-500 text-sm text-center mb-4">
              {errors.api}
            </p>
          )}
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="flex justify-center md:justify-start space-x-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-lg border rounded-sm focus:outline-none focus:ring-1 focus:ring-[#5F1327]"
                  required
                  disabled={isLoading}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-sm text-center">{errors.otp}</p>
            )}
            <p className="text-base text-[#6C7275] text-center md:text-start">
              Didn’t receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                className={`${
                  canResend
                    ? "text-[#5F1327] hover:underline"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={!canResend || isLoading}
              >
                {canResend
                  ? "Resend Code"
                  : `Resend Code (${formatTime(countdown)})`}
              </button>
            </p>
            <button
              type="submit"
              className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#5F1327]/60 disabled:bg-[#141718]/50"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify and Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminOtpPage;
