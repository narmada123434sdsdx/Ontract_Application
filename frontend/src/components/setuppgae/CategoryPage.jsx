import React, { useState, useEffect } from "react";
import "./css/categorypage.css";   // ← NOW USING SEPARATE CSS
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";

const CategoryPage = () => {
  const [formData, setFormData] = useState({
    CATEGORY_NAME: "",
    STATUS: "Active",
  });

  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  // ✅ Filter values
const [filters, setFilters] = useState({
  category: "",
  status: "",
});

  const [editingData, setEditingData] = useState({
    CATEGORY_NAME: "",
    STATUS: "",
  });

  const cleanInput = (value) => value.replace(/[^A-Za-z0-9-.& ]/g, "");

  const fetchCategories = async () => {
    try {
      const data = await apiGet("/api/category");
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleaned = name === "CATEGORY_NAME" ? cleanInput(value) : value;
    setFormData({ ...formData, [name]: cleaned });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const cleaned = name === "CATEGORY_NAME" ? cleanInput(value) : value;
    setEditingData({ ...editingData, [name]: cleaned });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await apiPost("/api/category", {
      category_name: formData.CATEGORY_NAME,
      status: formData.STATUS,
    });

    setFormData({ CATEGORY_NAME: "", STATUS: "Active" });
    fetchCategories();
    alert("Category added successfully!");
  };

  const handleUpdate = async (id) => {
    await apiPut(`/api/category/${id}`, {
      category_name: editingData.CATEGORY_NAME,
      status: editingData.STATUS,
    });

    setEditingId(null);
    fetchCategories();
    alert("Category status updated!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    await apiDelete(`/api/category/${id}`);
    fetchCategories();
  };

  // ✅ Apply Filters
const filteredCategories = categories.filter((cat) => {
  return (
    cat.category_name
      .toLowerCase()
      .includes(filters.category.toLowerCase()) &&
    cat.status.toLowerCase().includes(filters.status.toLowerCase())
  );
});

// ✅ Handle filter input change
const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters({ ...filters, [name]: value });
};



  return (
    <div className="category-page">

      <div className="category-container">

        {/* =================== ADD NEW CATEGORY ===================== */}
        <div className="cat-box">
          <h2>Add New Category</h2>

          <form className="cat-form" onSubmit={handleSubmit}>

            {/* HEADER */}
            <div className="cat-header-row">
              <div className="cat-header-cell">WORK CATEGORY</div>
              <div className="cat-header-cell"> STATUS</div>
            </div>

            {/* INPUT ROW */}
            <div className="cat-input-row">

              <div className="cat-input-wrapper">
                <input
                  type="text"
                  name="CATEGORY_NAME"
                  value={formData.CATEGORY_NAME}
                  onChange={handleChange}
                  required
                  placeholder="Enter Category Name"
                />
                <span className="cat-star">★</span>
              </div>

              <div className="cat-input-wrapper">
                <select
                  name="STATUS"
                  value={formData.STATUS}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="cat-star">★</span>
              </div>

            </div>

            {/* BUTTONS */}
            <div className="cat-actions">
              <button type="submit" className="cat-btn-primary">
                Submit
              </button>

              <button
                type="button"
                className="cat-btn-reset"
                onClick={() =>
                  setFormData({ CATEGORY_NAME: "", STATUS: "Active" })
                }
              >
                Reset
              </button>
            </div>

          </form>
        </div>

        {/* =================== TABLE ===================== */}
        <div className="type-box">
          <h2>Existing Categories</h2>

          <div className="type-table-wrapper">
            <div className="fixed-table">
            <table className="cat-table">
<thead>
  {/* ✅ Main Header Row */}
  <tr>
    <th>Work Category</th>
    <th>Status</th>
    <th>Actions</th>
  </tr>

  {/* ✅ Filter Input Row */}
  <tr>
    <th>
      <input
        type="text"
        name="category"
        placeholder="Filter category..."
        value={filters.category}
        onChange={handleFilterChange}
        className="cat-filter-input"
      />
    </th>

    <th>
      <input
        type="text"
        name="status"
        placeholder="Filter status..."
        value={filters.status}
        onChange={handleFilterChange}
        className="cat-filter-input"
      />
    </th>

    <th></th>
  </tr>
</thead>


              <tbody>
                {categories.length > 0 ? (
                  filteredCategories.map((cat) => (

                    <tr key={cat.id}>
                      {editingId === cat.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              name="CATEGORY_NAME"
                              value={editingData.CATEGORY_NAME}
                              onChange={handleEditChange}
                            />
                          </td>

                          <td>
                            <select
                              name="STATUS"
                              value={editingData.STATUS}
                              onChange={handleEditChange}
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </td>

                          <td>
                            <button
                              className="cat-btn-save"
                              onClick={() => handleUpdate(cat.id)}
                            >
                              Save
                            </button>
                            <button
                              className="cat-btn-cancel"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{cat.category_name}</td>
                          <td>{cat.status}</td>

                          <td>
                            <button
                              className="cat-btn-edit"
                              onClick={() => {
                                setEditingId(cat.id);
                                setEditingData({
                                  CATEGORY_NAME: cat.category_name,
                                  STATUS: cat.status,
                                });
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="cat-btn-delete"
                              onClick={() => handleDelete(cat.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="cat-no-data">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryPage;
