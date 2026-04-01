// src/pages/Contractor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/contractor.css";
import { apiGet } from "../../api";

const WorkOrders = () => {
  const [workorders, setWorkorders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWorkOrders = async () => {
    try {
      const data = await apiGet("/api/workorders/");

      const filtered = data.filter(
        (wo) => (wo.STATUS || "").toLowerCase() !== "accepted"
      );

      setWorkorders(filtered);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  if (loading) return <div className="center">Loading...</div>;
  if (error) return <div className="center error">Error: {error}</div>;

  return (
    <div className="workorders-fullpage-container">
      <div className="workorders-content">
        <h2 >Work Orders List</h2>

        <div className="table-wrapper">
          <table className="workorders-table">
            <thead>
              <tr>
                <th>Work Order</th>
                <th>Category</th>
                <th>Region</th>
                <th>Status</th>
                <th>Requested Time Close</th>
                <th>Remarks</th>
                <th>Created At</th>
                
              </tr>
            </thead>

            <tbody>
              {workorders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No workorders found
                  </td>
                </tr>
              ) : (
                workorders.map((wo) => (
                  <tr key={wo.workorder}>
                      
                    <td onClick={() => navigate(`/admin/workorder/contractor/workorders/${wo.workorder}`)}>
                      {wo.workorder}
                    </td>

                    <td>{wo.category_name}</td>
                    <td>{wo.region_name}</td>


                    <td>{wo.status}</td>

                    <td>{wo.requested_time_close || "N/A"}</td>

                    <td>{wo.remarks || "-"}</td>

                    <td>
                      {wo.created_t
                        ? new Date(wo.created_t).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;