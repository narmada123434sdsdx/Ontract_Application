import React, { useState } from "react";
import "./css/workorders.css";
import { apiGet } from "../../api";   // ✅ use .env-based API

const WorkOrders = () => {
  const [workorders, setWorkorders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showResults, setShowResults] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // -------------------------
  // Fetch Workorders
  // -------------------------
  const fetchFilteredWorkOrders = async () => {
    if (!fromDate || !toDate) {
      setModalMessage("⚠️ Please select both From Date and To Date.");
      setShowModal(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("from", fromDate);
      params.append("to", toDate);
      if (statusFilter !== "All") params.append("status", statusFilter);

      // ✅ Using apiGet(".env based")
      const data = await apiGet(`/api/workorders/filter?${params.toString()}`);

      if (!Array.isArray(data) || data.length === 0) {
        setModalMessage("📭 No workorders found for the selected filters.");
        setShowModal(true);
        setShowResults(false);
        setWorkorders([]);
      } else {
        setWorkorders(data);
        setShowResults(true);
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("All");
    setWorkorders([]);
    setShowResults(false);
  };

  // -------------------------
  const statusToClass = (status) => {
    const s = (status || "UNKNOWN").toString();
    return `status-${s.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const formatDate = (val) => {
    if (!val) return "N/A";
    try {
      const d = new Date(val);
      if (isNaN(d)) return val;
      return d.toLocaleString();
    } catch {
      return val;
    }
  };

  return (
    <div className="workorders-page">
    <div className="dashboard-card">
      <div className="dashboard-header">Work Orders Dashboard</div>

        <div className="dashboard-content">
          <div className="dashboard-filters">

            <div>
              <label>From Date:</label>
<input
                type="date"
                value={fromDate}
                min="2000-01-01"
                max="2099-12-31"
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label>To Date:</label>
          <input
                type="date"
                value={toDate}
                min="2000-01-01"
                max="2099-12-31"
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div>
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="OPEN">OPEN</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div className="dashboard-btn-group">
              <button className="btn btn-green" onClick={fetchFilteredWorkOrders}>
                🔍 Submit
              </button>
              <button className="btn btn-blue" onClick={resetFilters}>
                🔄 Reset
              </button>
            </div>
          </div>

          {loading && <div className="info-message">Loading workorders...</div>}
          {error && <div className="error-message">Error: {error}</div>}

          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <p>{modalMessage}</p>
                <button className="modal-btn" onClick={() => setShowModal(false)}>
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------ RESULTS ----------- */}
      {showResults && (
        <div className="results-main clean-results">
          <div className="results-content">

            {workorders.length > 0 ? (
              <div className="table-wrapper">
                <table className="workorders-table">
                  <thead>
                    <tr>
                      <th>Work Order</th>
                      <th>Category</th>
                      <th>Region</th>
                      <th>Status</th>
                      <th>Requested Time</th>
                      <th>Remarks</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {workorders.map((wo) => {
                      const status = wo.status || "UNKNOWN";
                      return (
                        <tr key={wo.id} className={statusToClass(status)}>
                          <td>{wo.workorder}</td>

                          {/* ✅ Category Name */}
                          <td>{wo.category_name || wo.category || "—"}</td>

                          {/* ✅ Region Name */}
                          <td>{wo.region_name || wo.region || "—"}</td>

                          <td className={`status ${status.toLowerCase()}`}>
                            {status}
                          </td>

                          <td>{formatDate(wo.requested_time_close)}</td>
                          <td>{wo.remarks || "N/A"}</td>
                          <td>{formatDate(wo.created_t)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="info-message">No work orders to display.</div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;