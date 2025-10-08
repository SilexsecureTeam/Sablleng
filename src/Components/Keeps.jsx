// src/pages/OtpPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../assets/auth1.png";
import logo from "../assets/logo.png";

const OtpPage = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errors, setErrors] = useState({});

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate("/signin");
    }
  };

  const handleResend = () => {
    console.log("Resend OTP clicked");
    // Implement resend OTP logic here
  };

  return (
    <div className="min-h-screen lg:h-screen h-fit flex flex-col md:flex-row font-poppins items-stretch">
      {/* Left Side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-gray-100">
        <img
          src={auth}
          alt="OTP verification background"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <img src={logo} alt="Logo" className="mb-16 w-32 h-auto mx-auto" />

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2 text-center md:text-start">
            Verify Your Account
          </h2>
          <p className="text-base text-[#6C7275] mb-6 text-center md:text-start">
            We’ve sent a 4-digit verification code to your registered email
            address or phone number. Please enter it below to complete your
            sign-up.
          </p>

          {/* Form */}
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
                  className="w-12 h-12 text-center text-lg border rounded-sm focus:outline-none focus:ring-1 focus:ring-[#CB5B6A]"
                  required
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
                className="text-[#CB5B6A] hover:underline"
              >
                Resend Code
              </button>
            </p>

            <button
              type="submit"
              className="w-full p-3 bg-[#141718] text-white rounded-md hover:bg-[#141718]/80 focus:outline-none focus:ring-2 focus:ring-[#CB5B6A]/60"
            >
              Verify and Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
