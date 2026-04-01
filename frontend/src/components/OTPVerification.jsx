import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./css/otpverification.css";
import { BASE_URLS } from '../api';
import { useUser } from "../context/UserContext";

function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // 🔥 CONTEXT
  const { loginUser } = useUser();

  // ⏳ Countdown logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const response = await fetch(`${BASE_URLS.user}/api/verify_otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    console.log("FULL RESPONSE FROM /api/verify_otp:", data);

    if (response.ok && data?.user) {
      console.log("✅ OTP VERIFIED");

      // 🔥 NORMALIZE DATA FOR GLOBAL CONTEXT (INDIVIDUAL)
      const userData = {
        ...data.user,
        role: "INDIVIDUAL",
      };

      console.log("🧠 INDIVIDUAL STORED IN CONTEXT:", userData);

      loginUser(userData);

      navigate("/provider_home", { replace: true });
    } else {
      setError(data?.error || "OTP verification failed");
    }
  } catch (err) {
    console.error("❌ OTP VERIFY ERROR:", err);
    setError("An error occurred. Please try again.");
  }
};

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URLS.user}/api/resend_otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('A new OTP has been sent to your email.');
        setTimer(30);
      } else {
        setError(data.error || 'Failed to resend OTP.');
      }
    } catch {
      setError('An error occurred while resending OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otpverification-container">
      <div className="otpverification-card">
        <h2 className="otpverification-title">Verify OTP</h2>
        <p className="otpverification-text">An OTP has been sent to {email}</p>

        {error && <p className="otpverification-error">{error}</p>}
        {success && <p className="otpverification-success">{success}</p>}

        <form onSubmit={handleSubmit} className="otpverification-form">
          <div className="otpverification-input-group">
            <label className="otpverification-label">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="otpverification-input"
              required
            />
          </div>
          <button type="submit" className="otpverification-button">
            Verify
          </button>
        </form>

        <button
          onClick={handleResendOtp}
          className="otpverification-resend-button"
          disabled={loading || timer > 0}
        >
          {loading
            ? 'Sending...'
            : timer > 0
            ? `Resend OTP (${timer}s)`
            : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}

export default OTPVerification;
