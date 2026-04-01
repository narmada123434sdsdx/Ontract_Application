import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./css/AdminLogin.css";
import { BASE_URLS } from "../api";
import { useAdmin } from "../context/AdminContext";

function AdminLogin() {
  const { loginAdmin } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();

  /* ================= LOGIN ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URLS.admin}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("otp");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URLS.admin}/api/admin/verify_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        const adminData = {
          email: data.admin_email,
          role: "ADMIN",
        };

        loginAdmin(adminData);
        localStorage.setItem("admin", JSON.stringify(adminData));

        navigate("/admin/home", { replace: true });
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URLS.admin}/api/admin/resend_otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setError("✅ OTP sent again to your email");
      } else {
        setError(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <div className="contract-header"></div>

        <div className="login-title">
          {step === "login" ? "Admin Login" : "Verify OTP"}
        </div>

        <div className="login-key">
          <img src="/assets/images/key.png" alt="Key" />
        </div>

        {error && <div className="login-error">{error}</div>}

        {step === "login" ? (
          <form onSubmit={handleLoginSubmit}>
            {/* EMAIL */}
            <div className="hw-input">
              <input
                type="email"
                placeholder="Admin Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div className="hw-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <span
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button className="go-btn" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            {/* OTP */}
            <div className="hw-input">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                maxLength="6"
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>

            <button className="go-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* RESEND OTP BUTTON */}
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0066ff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {resendLoading ? "Sending OTP..." : "Resend OTP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;