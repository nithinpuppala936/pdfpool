import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const Conversions = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (endpoint) => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);

    const formData = new FormData();

    // backend expects "pdf" or "document" based on endpoint
    if (endpoint === "pdf-to-word" || endpoint === "ocr") {
      formData.append("pdf", file);
    } else {
      formData.append("document", file);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/conversions/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setDownloadUrl(res.data.downloadUrl);
    } catch (err) {
      alert(err.response?.data?.error || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">File Conversions</h1>
        <p className="text-gray-600">Convert between different file formats</p>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Tools</h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleUpload("pdf-to-word")}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Convert PDF → Word
          </button>
          <button
            onClick={() => handleUpload("word-to-pdf")}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Convert Word → PDF
          </button>
          <button
            onClick={() => handleUpload("excel-to-pdf")}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            Convert Excel → PDF
          </button>
          <button
            onClick={() => handleUpload("ocr")}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded"
          >
            Run OCR
          </button>
        </div>

        {downloadUrl && (
          <div className="mt-6">
            <p className="font-semibold">✅ Conversion successful!</p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversions;
