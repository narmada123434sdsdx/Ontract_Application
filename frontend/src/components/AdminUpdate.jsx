import React, { useState } from "react";
import "./css/AdminUpdate.css";
import { BASE_URL } from "../api";

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

function AdminUpdate() {
  const [searchEmail, setSearchEmail] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    modules: [],
  });

  // SEARCH
  const handleSearch = async () => {
    if (!searchEmail) {
      alert("❌ Please enter email");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/workorders/admin/get-user/${searchEmail}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData({
          fullName: data.data.fullName || "",
          email: data.data.email || "",
          mobile: data.data.mobile || "",
          modules: data.data.modules || [],
        });
      } else {
        alert(`❌ ${data.message || "User not found"}`);
      }
    } catch (error) {
      alert("❌ Server error");
    }
  };

  // RESET
  const handleReset = () => {
    setSearchEmail("");
    setFormData({
      fullName: "",
      email: "",
      mobile: "",
      modules: [],
    });
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // MODULE CHANGE
  const handleModuleChange = (module) => {
    setFormData((prev) => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter((m) => m !== module)
        : [...prev.modules, module],
    }));
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/workorders/admin/update-user`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("✅ User updated successfully");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Server error");
    }
  };

  return (
    <div className="update-user-container">
      

      {/* ================= SEARCH SECTION ================= */}
      <div className="search-section">
        <div className="search-header-row">

          <div className="section-title">Search User</div>

          <div className="search-bar">
            <input
              type="email"
              placeholder="Enter email to search"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />

            <button onClick={handleSearch}>Search</button>

            <button className="reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* ================= DETAILS SECTION ================= */}
      <div className="details-section">
        <div className="section-title">User Details</div>

        <div className="update-form-row">
          <div>
            <div className="form-label">Full Name</div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <div className="form-label">Mobile Number</div>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>
        </div>

        <div className="full-width">
          <div className="form-label">Email</div>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="readonly-input"
          />
        </div>

        {/* Modules */}
        <div className="modules-section">
          <div className="modules-title">Assign Modules</div>

          <div className="modules-grid">
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

        <button className="update-btn" onClick={handleUpdate}>
          Update User
        </button>
      </div>
    </div>
  );
}

export default AdminUpdate;