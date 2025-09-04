import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Forms = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch forms from backend
  const fetchForms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/forms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForms(res.data.forms || []);
    } catch (err) {
      console.error("Fetch forms error:", err);
    }
  };

  // Create a new form
  const createForm = async () => {
    if (!title) return alert("Form title is required!");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/forms`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      fetchForms();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create form");
    } finally {
      setLoading(false);
    }
  };

  // Delete a form
  const deleteForm = async (id) => {
    if (!window.confirm("Delete this form?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchForms();
    } catch (err) {
      alert("Failed to delete form");
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PDF Forms</h1>
        <p className="text-gray-600">Create and manage PDF form templates</p>
      </div>

      {/* Create Form */}
      <div className="card p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Create New Form</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter form title..."
          className="border p-2 rounded w-full"
        />
        <button
          onClick={createForm}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create Form"}
        </button>
      </div>

      {/* List Forms */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Templates</h2>
        {forms.length === 0 ? (
          <p className="text-gray-600">No forms created yet.</p>
        ) : (
          <ul className="space-y-2">
            {forms.map((form) => (
              <li
                key={form.id}
                className="flex justify-between items-center border p-2 rounded"
              >
                <span>{form.title}</span>
                <button
                  onClick={() => deleteForm(form.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Forms;
