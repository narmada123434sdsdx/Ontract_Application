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

    try {
      const data = await apiPost("/api/contractor/verify_otp", {
        email,
        otp,
      });

      console.log("API RESPONSE:", data);

      if (data?.contractor) {
        console.log("✅ OTP VERIFIED");

        // 🔥 CRITICAL FIX (mobile support)
        if (data?.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        const contractorData = {
          ...data.contractor,
          role: "CONTRACTOR",
        };

        loginContractor(contractorData);

        console.log("🧠 Contractor stored in context");

        navigate("/contractor/dashboard/companydashboardhome", {
          replace: true,
        });
      } else {
        // ❌ cleanup old token (important)
        localStorage.removeItem("refresh_token");

        console.error("❌ OTP FAILED:", data);
        setError(data?.error || "Invalid OTP");
      }
    } catch (err) {
      console.error("🚨 VERIFY OTP ERROR:", err);

      // ❌ cleanup on error also
      localStorage.removeItem("refresh_token");

      setError(err.message || "Verification failed. Please try again.");
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

    try {
      const data = await apiPost("/api/contractor/resend_otp", {
        email,
      });

      console.log("RESEND RESPONSE:", data);
      setMessage(data?.message || "OTP resent successfully!");
    } catch (err) {
      console.error("🚨 RESEND OTP ERROR:", err);
      setError(err.message || "Failed to resend OTP.");
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