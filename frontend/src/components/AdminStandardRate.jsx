import React, { useState, useEffect, useRef } from "react";
import "./css/AdminStandardRate.css";
import { apiGet, apiPost, apiPut, apiDelete, BASE_URLS } from "../api";
import { useAdmin } from "../context/AdminContext";
import { Ban } from "lucide-react";



export default function AdminStandardRates() {
  const { admin: ctxAdmin } = useAdmin();
const permissionLevel = ctxAdmin?.email?.permission_level;
const hasPriceEditAccess = permissionLevel === 1;


  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // filters
  const [tradeFilter, setTradeFilter] = useState("");        // Category
  const [catFilter, setCatFilter] = useState("");            // Item
  const [typeFilter, setTypeFilter] = useState("");          // Type
  const [subTypeFilter, setSubTypeFilter] = useState("");    // Sub Type
  const [brandFilter, setBrandFilter] = useState("");        // Brand
  const [search, setSearch] = useState("");                  // Description
  const [clientFilter, setClientFilter] = useState("");      // Client


  // upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // validations
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const canEditOrDelete = permissionLevel === 1;

  // form fields
  const emptyForm = {
    category: "",
    item: "",
    type: "",
    sub_type: "",
    brand: "",
    description: "",
    unit: "",
    copper_pipe_price: "",
    price_rm: "",
    client: "",
  };

  const editableFieldsForPriceAccess = [
  "brand",
  "sub_type",
  "unit",
  "copper_pipe_price",
  "price_rm",
  "client",
  "type",
  "description",
  "item",
  "category",
];



  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // Fetch Data
  useEffect(() => {
      fetchRates();
    }, [page,tradeFilter,catFilter,typeFilter,subTypeFilter,brandFilter,search,clientFilter,]);


  const fetchRates = async () => {
    setLoading(true);
    try {
      const url =
      `/api/admin/standard_rates?page=${page}&limit=${limit}` +
      `&category=${tradeFilter || ""}` +
      `&item=${catFilter || ""}` +
      `&type=${typeFilter || ""}` +
      `&sub_type=${subTypeFilter || ""}` +
      `&brand=${brandFilter || ""}` +
      `&search=${search || ""}` +
      `&client=${clientFilter || ""}`;


      const res = await apiGet(url);
      setRates(Array.isArray(res.results) ? res.results : []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Error fetching rates:", err);
      setRates([]);
      setTotal(0);
    }
    setLoading(false);
  };
  
  // ✅ DOWNLOAD CSV TEMPLATE
  const downloadCSVTemplate = () => {
    const headers = [
      "category",
      "item",
      "type",
      "sub_type",
      "brand",
      "description",
      "unit",
      "copper_pipe_price",
      "price_rm",
      "client",
    ];


    const csvContent = headers.join(",") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "standard_rate_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Upload Excel
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert("Please select a CSV file");
      if (!uploadFile.name.toLowerCase().endsWith(".csv")) {
      alert("Only CSV files are allowed");
      setUploadFile(null);
      return;
      }
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);

      const res = await apiPost(
        `/api/admin/standard_rates/upload_excel`,
        fd
      );

      setUploadResult(res.result || res);
      alert("Upload Completed");
      setUploadFile(null);
      fetchRates();
    } catch (err) {
      alert(err.message || "Upload failed");
    }
  };
  const handleCancelUpload = () => {
    setUploadFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // Open Add Modal
  const openAddModal = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.category?.trim())
      newErrors.category = "Category is required";

    if (!form.item?.trim())
      newErrors.item = "Item is required";
    
    if (!form.type?.trim())
      newErrors.type = "Type is required";

    if (!form.description?.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open Edit Modal
const openEditModal = (row) => {
  if (!canEditOrDelete) return; // 🔒 hard stop

  setIsEditing(true);
  setEditId(row.id);
  setForm({ ...row });
  setErrors({});
  setShowModal(true);
};


 const handleSave = async () => {
  if (!validateForm()) return;

  let payload = { ...form };

  if (hasPriceEditAccess) {
    // keep only allowed editable fields
    Object.keys(payload).forEach((key) => {
      if (!editableFieldsForPriceAccess.includes(key)) {
        delete payload[key];
      }
    });
  } else {
    // permission 2 → no edit at all
    return;
  }

  try {
    if (isEditing) {
      await apiPut(`/api/admin/standard_rates/${editId}`, payload);
      alert("Updated successfully");
    } else {
      await apiPost(`/api/admin/standard_rates`, payload);
      alert("Added successfully");
    }
    setShowModal(false);
    fetchRates();
  } catch (err) {
    alert(err.message || "Operation failed");
  }
};

  // Delete
const handleDelete = async (id) => {
  if (!canEditOrDelete) return; // 🔒 hard stop

  if (!window.confirm("Are you sure to delete this record?")) return;
  try {
    await apiDelete(`/api/admin/standard_rates/${id}`);
    fetchRates();
  } catch (err) {
    alert(err.message || "Delete failed");
  }
};


  const maskIfNoPermission = (value) => {
  if (permissionLevel === 2) {
    return "XXX";
  }
  return value;
};

const ActionButton = ({ children, disabled, onClick, className }) => {
  return (
    <div className="action-btn-wrapper">
      <button
        className={className}
        onClick={onClick}
        disabled={disabled}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        {children}
      </button>

      {disabled && (
        <span className="no-access-icon" title="You don't have permission">
          <Ban size={14} />
        </span>
      )}
    </div>
  );
};




  return (
    <div className="container mt-4">
      <h2 className="mb-3">Standard Rate Management (SOR)</h2>
      {/* TOP ACTIONS */}
      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-outline-primary"
          onClick={downloadCSVTemplate}
        >
          Download CSV Template
        </button>

        <button className="btn btn-success" onClick={openAddModal}>
          Add New Rate
        </button>
      </div>
      {/* Excel Upload */}
      <div className="card p-3 mb-4">
        <h5>Upload CSV</h5>

        <form onSubmit={handleUpload}>
          {/* File input */}
          <div className="mb-2">
            <input
              type="file"
              accept=".csv"
              className="form-control"
              style={{ maxWidth: "350px" }}
              ref={fileInputRef}
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
          </div>

          {/* Buttons like Add New Rate */}
          <div className="d-flex gap-2 mt-3 upload-btn-group">
            <button
              type="submit"
              className="btn btn-success"
              disabled={!uploadFile}
            >
              Upload
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCancelUpload}
              disabled={!uploadFile}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>



      {/* Table */}
      <div className="card p-3">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Sub Type</th>
                  <th>Brand</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Copper Price</th>
                  <th>Price (RM)</th>
                  <th>Client</th>
                  <th>Actions</th>
                </tr>

                {/* ✅ COLUMN FILTER ROW (UNCHANGED) */}
                <tr>
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={tradeFilter}
                      onChange={(e) => {
                        setTradeFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Item */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={catFilter}
                      onChange={(e) => {
                        setCatFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Type */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={typeFilter}
                      onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Sub Type */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={subTypeFilter}
                      onChange={(e) => {
                        setSubTypeFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Brand */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={brandFilter}
                      onChange={(e) => {
                        setBrandFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Description */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Unit (no filter) */}
                  <th></th>

                  {/* Copper Price (no filter) */}
                  <th></th>

                  {/* Price RM (no filter) */}
                  <th></th>

                  {/* Client */}
                  <th>
                    <input
                      className="form-control form-control-sm"
                      value={clientFilter}
                      onChange={(e) => {
                        setClientFilter(e.target.value);
                        setPage(1);
                      }}
                    />
                  </th>

                  {/* Actions */}
                  <th></th>
                </tr>

              </thead>

              <tbody>
                {rates.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="11" className="text-center">
                      No data
                    </td>
                  </tr>
                ) : (
                  rates.map((row) => (
                    <tr key={row.id}>
                      <td>{row.category}</td>
                      <td>{row.item}</td>
                      <td>{row.type}</td>
                      <td>{row.sub_type}</td>
                      <td>{row.brand}</td>
                      <td>{row.description}</td>
                      <td>{row.unit}</td>
<td>{maskIfNoPermission(row.copper_pipe_price)}</td>
<td>{maskIfNoPermission(row.price_rm)}</td>

                      <td>{row.client}</td>
                      <td>
<ActionButton
  className="btn btn-sm btn-warning me-2"
  onClick={() => openEditModal(row)}
  disabled={!canEditOrDelete}
>
  Edit
</ActionButton>

<ActionButton
  className="btn btn-sm btn-danger"
  onClick={() => handleDelete(row.id)}
  disabled={!canEditOrDelete}
>
  Delete
</ActionButton>


                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ✅ FIXED PAGINATION */}
            <div className="d-flex justify-content-center mt-3">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setPage(1)}>
                      &laquo;
                    </button>
                  </li>

                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      &lsaquo;
                    </button>
                  </li>

                  {(() => {
                    const totalPages = Math.ceil(total / limit) || 1;
                    const pages = [];

                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, page + 2);

                    if (start > 1) {
                      pages.push(
                        <li key={1} className="page-item">
                          <button className="page-link" onClick={() => setPage(1)}>
                            1
                          </button>
                        </li>
                      );
                      if (start > 2) {
                        pages.push(
                          <li key="s-ellipsis" className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(
                        <li
                          key={i}
                          className={`page-item ${i === page ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => setPage(i)}>
                            {i}
                          </button>
                        </li>
                      );
                    }

                    if (end < totalPages) {
                      if (end < totalPages - 1) {
                        pages.push(
                          <li key="e-ellipsis" className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      pages.push(
                        <li key={totalPages} className="page-item">
                          <button
                            className="page-link"
                            onClick={() => setPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      );
                    }

                    return pages;
                  })()}

                  <li
                    className={`page-item ${
                      page === Math.ceil(total / limit) ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      &rsaquo;
                    </button>
                  </li>

                  <li
                    className={`page-item ${
                      page === Math.ceil(total / limit) ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(Math.ceil(total / limit))}
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? "Edit Rate" : "Add New Rate"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {Object.keys(form).map((key) => {
                  // ❌ HIDE THESE FIELDS
                  if (key === "source_row_number" || key === "extra_col") {
                    return null;
                  }

                 


                  return (
                    <div className="mb-3" key={key}>
                      <label className="form-label fw-semibold">
                        {{
                          category: "Category",
                          item: "Item",
                          type: "Type",
                        }[key] || key.replace(/_/g, " ").toUpperCase()}
                      </label>

<input
  className={`form-control ${errors[key] ? "is-invalid" : ""}`}
  value={form[key] || ""}
  disabled={
    !hasPriceEditAccess || 
    !editableFieldsForPriceAccess.includes(key)
  }
  onChange={(e) =>
    setForm({ ...form, [key]: e.target.value })
  }
/>



                      {errors[key] && (
                        <div className="invalid-feedback">{errors[key]}</div>
                      )}
                    </div>
                  );
                })}
              </div>


              <div className="modal-footer">
                <button className="btn btn-success" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}