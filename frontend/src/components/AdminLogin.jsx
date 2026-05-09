import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./css/AdminLogin.css";
import { BASE_URLS } from "../api";
import { useAdmin } from "../context/AdminContext";

// ✅ Firebase (WEB ONLY)
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

function AdminLogin({ setAdmin }) {
  const { loginAdmin } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        console.log("✅ Admin login successful, OTP sent");
        setStep("otp");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP ================= */
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
        console.log("✅ OTP VERIFIED (ADMIN)");

        // 🔥 Normalize admin data
        const adminData = {
          ...data.admin_email,
          role: "ADMIN",
        };

        // ✅ Store in context + localStorage
        loginAdmin(adminData);
        setAdmin({ email: data.admin_email });
        localStorage.setItem("admin", JSON.stringify(adminData));

        console.log("🧠 Admin stored:", adminData);

        // =========================
        // 🌐 WEB PUSH (ADMIN ONLY)
        // =========================
        let fcmToken = null;

        try {
          const permission = await Notification.requestPermission();

          if (permission === "granted") {
            fcmToken = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
            });

            console.log("🔥 ADMIN WEB TOKEN:", fcmToken);
          } else {
            console.warn("❌ Notification permission denied");
          }
        } catch (err) {
          console.error("❌ Token error:", err);
        }

        if (fcmToken) {
          try {
            await fetch(`${BASE_URLS.admin}/api/save_token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: adminData.admin_id,
                fcm_token: fcmToken,
                device_type: "web",
                role: "ADMIN", // 🔥 KEY POINT
              }),
            });

            console.log("✅ Admin token saved");
          } catch (err) {
            console.error("❌ Save token error:", err);
          }
        }

        // ✅ Navigate AFTER token save
        navigate("/admin/home", { replace: true });

      } else {
        setError(data.error || "OTP verification failed");
      }
    } catch (err) {
      console.error("❌ OTP verify error:", err);
      setError("OTP verification failed");
    } finally {
      setLoading(false);
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
              <span onClick={() => setShowPassword(!showPassword)}>
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
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;