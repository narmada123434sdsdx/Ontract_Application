import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";
import "./css/AdminNotification.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api";

function AdminNotifications() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [selectedWorkorder, setSelectedWorkorder] = useState(null);
  const [selectedContractors, setSelectedContractors] = useState([]);
  const [activeTab, setActiveTab] = useState("ASSIGNED");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  /* =========================
     TOGGLE CONTRACTOR SELECTION
     ========================= */

  const toggleContractorSelection = (userUid) => {
    setSelectedContractors((prev) =>
      prev.includes(userUid)
        ? prev.filter((id) => id !== userUid)
        : [...prev, userUid]
    );
  };

  /* =========================
     FETCH WORKORDERS
     ========================= */
  const fetchWorkorders = async (tab) => {
    try {
      let res = [];

      if (tab === "ASSIGNED") {
        res = await apiGet("/api/workorders/admin/notifications/assigned");
      } else if (tab === "OPEN") {
        res = await apiGet("/api/workorders/admin/notifications/close");
      } else if (tab === "COMPLETED") {
        res = await apiGet("/api/workorders/admin/notifications/invoice");
      } else if (tab === "OVERRATED") {
        res = await apiGet("/api/workorders/admin/notifications/overrated");
      }

      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setData([]);
    }
  };

  useEffect(() => {
    fetchWorkorders(activeTab);
    setSelectedContractors([]);
  }, [activeTab]);

  /* =========================
     CLICK WORKORDER ROW
     ========================= */
  const handleWorkorderClick = async (row) => {
    const workorderId =
      row.WORKORDER_ID || row.workorder_id || row.workorder;

    setShowModal(true);
    setSelectedWorkorder(workorderId);
    setSelectedContractors([]);
    setDetails([]);
    setAdminRemarks("");

    // 🔥 ASSIGNED TAB → contractor list
    if (activeTab === "ASSIGNED") {
      try {
        setLoading(true);
        const res = await apiGet(
          `/api/workorders/admin/notifications/contractorlist?workorder_id=${workorderId}`
        );
        setDetails(res?.data || []);
      } catch (err) {
        console.error(err);
        setDetails([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 🔥 OPEN TAB → completed workorder details
    if (activeTab === "OPEN") {
      try {
        setLoading(true);
        const res = await apiGet(
          `/api/workorders/admin/notifications/completed_workorder?workorder_id=${workorderId}`
        );
        setDetails(res || []);
      } catch (err) {
        console.error(err);
        setDetails([]);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // 🔥 OVERRATED TAB → CALL SECOND API
    if (activeTab === "OVERRATED") {
      try {
        setLoading(true);
        const res = await apiGet(
          `/api/workorders/admin/notifications/overrated/details?workorder_id=${workorderId}`
        );
        if (res?.data) {
          setDetails([res.data]);
        } else {
          setDetails([]);
        }

      } catch (err) {
        console.error("Overrated details error:", err);
        setDetails([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setDetails([row]);
  };

  /* =========================
     ASSIGN CONTRACTOR
     ========================= */

  const handleCloseWorkorder = async () => {
    if (!adminRemarks.trim()) {
      alert("Admin remarks are required");
      return;
    }

    try {
      setAdminSubmitting(true);

      await apiPost("/api/workorders/admin/close", {
        workorder: selectedWorkorder,
        remarks: adminRemarks,
      });

      alert("✅ Workorder closed successfully");

      closeModal();
      fetchWorkorders(activeTab); // 🔥 refresh list
    } catch (err) {
      console.error(err);
      alert("❌ Failed to close workorder");
    } finally {
      setAdminSubmitting(false);
    }
  };


  const handleReopenWorkorder = async () => {
    if (!adminRemarks.trim()) {
      alert("Admin remarks are required");
      return;
    }

    try {
      setAdminSubmitting(true);

      await apiPost("/api/workorders/admin/reopen", {
        workorder: selectedWorkorder,
        remarks: adminRemarks,
      });

      alert("✅ Workorder reopened successfully");

      closeModal();
      fetchWorkorders(activeTab); // 🔥 refresh list
    } catch (err) {
      console.error(err);
      alert("❌ Failed to reopen workorder");
    } finally {
      setAdminSubmitting(false);
    }
  };


  const handleAssignContractor = async () => {
    if (selectedContractors.length === 0) {
      alert("Please select at least one contractor");
      return;
    }

    try {
      setAssigning(true);

      const selectedData = details.filter((c) =>
        selectedContractors.includes(c.user_uid)
      );

      await apiPost("/api/workorders/send-email-acceptence", {
        workorder: selectedWorkorder,
        contractors: selectedData,
      });

      alert("✅ Acceptance email sent successfully");
      closeModal();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send acceptance email");
    } finally {
      setAssigning(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDetails([]);
    setSelectedWorkorder(null);
    setSelectedContractors([]);
    setAdminRemarks("");
  };

  /* =========================
     JSX
     ========================= */
  return (
    <div className="container-fluid my-5 px-0">
      <div className="workorder-card mx-auto">
        <div className="workorder-header">Admin Notifications</div>

        <div className="workorder-inner">
          <div className="workorder-tabs">
            <button
              className={`tab-btn ${activeTab === "ASSIGNED" ? "active" : ""}`}
              onClick={() => setActiveTab("ASSIGNED")}
            >
              WorkOrder Assignment Notifications
            </button>
            <button
              className={`tab-btn ${activeTab === "OPEN" ? "active" : ""}`}
              onClick={() => setActiveTab("OPEN")}
            >
              Completed Notifications
            </button>
           {/* <button
              className={`tab-btn ${activeTab === "COMPLETED" ? "active" : ""}`}
              onClick={() => setActiveTab("COMPLETED")}
            >
              Invoice Notifications
            </button>*/}
            <button
              className={`tab-btn ${activeTab === "OVERRATED" ? "active" : ""}`}
              onClick={() => setActiveTab("OVERRATED")}
            >
              Overrated Notifications
            </button>
          </div>

          {data.length === 0 ? (
            <p className="text-center text-muted py-4">
              No records found
            </p>
          ) : (
            <div className="workorder-table-wrapper">
              <table className="workorder-table">
                <thead>
                  <tr>
                    <th>Work Order</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      <td
                        className="workorder-link"
                        onClick={() => handleWorkorderClick(row)}
                      >
                        {row.WORKORDER_ID ||
                          row.workorder_id ||
                          row.workorder}
                      </td>
                      <td>{row.notification_type || row.status}</td>
                      <td>{row.created_at || row.assigned_at}</td>
                      <td className="remarks-cell">{row.message || row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================= MODAL ========================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box modal-xl">
            <span className="modal-close" onClick={closeModal}>×</span>

            {/* ================= ASSIGNED TAB ================= */}
            {activeTab === "ASSIGNED" && (
              <>
                <div className="modal-header">
                  Contractors for Work Order {selectedWorkorder}
                </div>

                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : (
                  <>
                    <div className="workorder-table-wrapper">
                      <div className="horizontal-scroll">
                        <table className="workorder-table full-width-table">
                          <thead>
                            <tr>
                              <th>Select</th>
                              <th>Contractor Name</th>
                              <th>Email</th>
                              <th>Location</th>
                              <th>Service Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.map((c, idx) => (
                              <tr key={idx}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={selectedContractors.includes(c.user_uid)}
                                    onChange={() =>
                                      toggleContractorSelection(c.user_uid)
                                    }
                                  />
                                </td>
                                <td>{c.name}</td>
                                <td>{c.email_id}</td>
                                <td>{c.city}, {c.state}</td>
                                <td>₹ {c.rate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="text-end mt-3">
                      <button
                        className="btn btn-primary"
                        disabled={selectedContractors.length === 0 || assigning}
                        onClick={handleAssignContractor}
                      >
                        {assigning ? "Assigning..." : "Assign Contractor"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ================= COMPLETED NOTIFICATIONS ================= */}
            {activeTab === "OPEN" && details.length > 0 && (
              <>
                <div className="modal-header">Work Order Details</div>

                <div className="kv-grid">
                  {[
                    ["Work Order", details[0].workorder],
                    ["Region", details[0].region_name],
                    ["State", details[0].state_name],
                    ["City", details[0].city_name],
                    ["Client", details[0].client],
                    ["Work Category", details[0].category_name],
                    ["Work Item", details[0].item_name],
                    ["Work Type", details[0].type_name],
                    ["Description", details[0].description_name],
                    ...(details[0].detailed_description
    ? [["Detailed Description", details[0].detailed_description]]
    : []),
                    ["Remarks", details[0].remarks],
                    ["Completed At", details[0].workorder_completed_time],

                  ].map(([k, v], i) => (
                    <div className="kv-row" key={i}>
                      <span className="kv-label">{k}</span>
                      <span className="kv-value">{v}</span>
                    </div>
                  ))}

                  {details[0].closing_images?.length > 0 && (
                    <div className="kv-row">
                      <span className="kv-label">Closing Proof</span>
                      <span className="kv-value">
                        <div className="media-preview-grid large">
                          {details[0].closing_images.map((url, i) => {
                            const isVideo = url.match(/\.(mp4|mov|avi|webm)$/i);
                            const fullUrl = `${BASE_URL}${url}`;

                            return (
                              <a
                                key={i}
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                {isVideo ? (
                                  <video src={fullUrl} className="media-preview" />
                                ) : (
                                  <img src={fullUrl} className="media-preview" />
                                )}
                              </a>
                            );
                          })}
                        </div>
                      </span>
                    </div>
                  )}
                  {/* 📝 ADMIN REMARKS */}
                <div className="remarks-section">
                  <label className="remarks-label">Admin Remarks</label>

                  <textarea
                    className="remarks-textarea"
                    rows="4"
                    placeholder="Enter admin remarks..."
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                  />

                  <div className="remarks-actions">
                    <button
                      className="btn-reject"
                      disabled={adminSubmitting}
                      onClick={handleReopenWorkorder}
                    >
                      Reopen Workorder
                    </button>

                    <button
                      className="btn-accept"
                      disabled={adminSubmitting}
                      onClick={handleCloseWorkorder}
                    >
                      Close Workorder
                    </button>
                  </div>
                </div>



                </div>
              </>
            )}
            {/* ================= OVERRATED NOTIFICATIONS ================= */}
            {activeTab === "OVERRATED" && (
              <>
                <div className="modal-header">
                  Overrated Work Order Details
                </div>

                {loading ? (
                  <p className="text-center">Loading...</p>
                ) : details.length > 0 ? (
                  <div className="kv-grid">
                    {[
                      ["Work Order", details[0].workorder],
                      ["Client", details[0].client],
                      ["Region", details[0].region_name],
                      ["State", details[0].state_name],
                      ["City", details[0].city_name],
                      ["Category", details[0].category_name],
                      ["Item", details[0].item_name],
                      ["Type", details[0].type_name],
                      ["Description", details[0].description_name],
                      ["Requested Close Time", details[0].requested_time_close],
                      ["Standard Rate", `₹ ${details[0].standard_rate}`],
                      ["Remarks", details[0].remarks],
                    ].map(([label, value], index) => (
                      <div className="kv-row" key={index}>
                        <span className="kv-label">{label}</span>
                        <span className="kv-value">{value || "-"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted">No details found</p>
                )}
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;