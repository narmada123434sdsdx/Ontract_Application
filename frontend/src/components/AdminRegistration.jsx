import React, { useState } from "react";
import "./css/AdminRegistration.css";
import { BASE_URL } from "../api";

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    modules: [],
  });

  const modulesList = [
    "Home",
    "Registration",
    "Set Up page",
    "Work Orders",
    "Standard Rate",
    "Management",
    "Notifications",
    "Reports",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModuleChange = (module) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      mobile: "",
      modules: [],
    });
  };

  // 🔥 REGISTER API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic frontend validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.mobile
    ) {
      alert("❌ Please fill all required fields");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/workorders/admin/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ User Registered Successfully");
        resetForm();
      } else {
        alert(`❌ ${data.message || data.error || "Registration failed"}`);
      }
    } catch (error) {
      console.error("API ERROR:", error);
      alert("❌ Server error. Please try again.");
    }
  };

  return (
    <div className="registration-container">
      <div className="section-card">
        <div className="section-header">USER REGISTRATION</div>

        <div className="section-content">
          <div className="form-header-row">
            <div>FULL NAME</div>
            <div>EMAIL</div>
          </div>

          <div className="form-input-row">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-header-row">
            <div>PASSWORD</div>
            <div>MOBILE NUMBER</div>
          </div>

          <div className="form-input-row">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />

            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="modules-section">
            <div className="form-header-row">
              <div>Assign Modules</div>
            </div>

            <div className="modules-row">
              {modulesList.map((mod) => (
                <label key={mod}>
                  <input
                    type="checkbox"
                    checked={formData.modules.includes(mod)}
                    onChange={() => handleModuleChange(mod)}
                  />
                  {mod}
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button className="blue-btn" onClick={handleSubmit}>
              Register
            </button>

            <button
              type="button"
              className="blue-btn cancel"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;