import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/CompanyOTPVerification.css";
import { apiPost } from "../../api";
import { useContractor } from "../../context/ContractorContext";

function CompanyOTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // ✅ CONTRACTOR CONTEXT (REPLACED USER CONTEXT)
  const { loginContractor } = useContractor();

  /* =========================
     VERIFY OTP
  ========================= */
  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    console.group("🔐 CONTRACTOR OTP VERIFY");
    console.log("Email:", email);
    console.log("OTP:", otp);

    try {
      const data = await apiPost("/api/contractor/verify_otp", {
        email,
        otp,
      });

      console.log("API RESPONSE:", data);

      if (data?.contractor) {
        console.log("✅ OTP VERIFIED");

        // 🔥 NORMALIZE CONTRACTOR DATA
        const contractorData = {
          ...data.contractor,
          role: "CONTRACTOR",
        };

        // ✅ STORE IN CONTRACTOR CONTEXT
        loginContractor(contractorData);

        console.log("🧠 Contractor stored in ContractorContext");

        // ✅ Prevent back navigation to OTP page
        navigate("/contractor/dashboard/companydashboardhome", {
          replace: true,
        });
      } else {
        console.error("❌ OTP FAILED:", data);
        setError("Invalid OTP");
      }
    } catch (err) {
      console.error("🚨 VERIFY OTP ERROR:", err);
      setError("Verification failed. Please try again.");
    } finally {
      console.groupEnd();
      setLoading(false);
    }
  };

  /* =========================
     RESEND OTP
  ========================= */
  const handleResend = async () => {
    setError("");
    setMessage("");
    setResendLoading(true);

    console.group("🔁 RESEND CONTRACTOR OTP");
    console.log("Email:", email);

    try {
      const data = await apiPost("/api/contractor/resend_otp", {
        email,
      });

      console.log("RESEND RESPONSE:", data);
      setMessage(data?.message || "OTP resent successfully!");
    } catch (err) {
      console.error("🚨 RESEND OTP ERROR:", err);
      setError("Failed to resend OTP.");
    } finally {
      console.groupEnd();
      setResendLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>OTP Verification</h2>

        <p>
          We’ve sent an OTP to <strong>{email}</strong>
        </p>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleVerify}>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          className="resend-btn"
          onClick={handleResend}
          disabled={resendLoading}
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}

export default CompanyOTPVerification;
