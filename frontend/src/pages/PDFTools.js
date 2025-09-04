import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Scissors, RotateCw, Download, Trash2, History, Cloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";


const PDFTools = () => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [splitRange, setSplitRange] = useState({ startPage: 1, endPage: 1 });
  const [rotateAngle, setRotateAngle] = useState(90);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
    }
    setFiles(prev => [...prev, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: activeTab === 'merge'
  });

  // Remove file from list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Load PDF history
  const loadHistory = async () => {
    try {
      const response = await axios.get('/api/pdfs/history');
      setHistory(response.data.pdfs || []);
    } catch (error) {
      console.error('History load error:', error);
      setHistory([]);
      if (error.response?.status === 401) {
        toast.error('Please log in to access PDF tools');
      } else if (error.response?.status === 404) {
        toast.error('PDF service not available. Please try again later.');
      }
    }
  };

  // Handle PDF operations
  const handleOperation = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();

    try {
      switch (activeTab) {
        case 'merge':
          if (files.length < 2) {
            toast.error('At least 2 PDF files are required for merging');
            setLoading(false);
            return;
          }
          files.forEach(file => formData.append('pdfs', file));
          break;

        case 'split':
          if (files.length !== 1) {
            toast.error('Please select exactly one PDF file for splitting');
            setLoading(false);
            return;
          }
          formData.append('pdf', files[0]);
          formData.append('startPage', splitRange.startPage);
          formData.append('endPage', splitRange.endPage);
          break;

        case 'compress':
          if (files.length !== 1) {
            toast.error('Please select exactly one PDF file for compression');
            setLoading(false);
            return;
          }
          formData.append('pdf', files[0]);
          break;

        case 'rotate':
          if (files.length !== 1) {
            toast.error('Please select exactly one PDF file for rotation');
            setLoading(false);
            return;
          }
          formData.append('pdf', files[0]);
          formData.append('angle', rotateAngle);
          // Assuming the backend handles rotating all pages if pageNumber is not provided
          break;

        default:
          toast.error('Invalid operation');
          setLoading(false);
          return;
      }

      const response = await axios.post(`/api/pdfs/${activeTab}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(response.data.message);
      setFiles([]);
      loadHistory(); // Re-fetch history to show the new operation

      // Auto-download the result
      if (response.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = response.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete operation from history
  const deleteOperation = async (id) => {
    try {
      await axios.delete(`/api/pdfs/${id}`);
      toast.success('Operation deleted successfully');
      loadHistory();
    } catch (error) {
      toast.error('Failed to delete operation');
    }
  };

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const tabs = [
    { id: 'merge', label: 'Merge PDFs', icon: FileText },
    { id: 'split', label: 'Split PDF', icon: Scissors },
    { id: 'compress', label: 'Compress PDF', icon: Cloud }, // Changed icon for compress
    { id: 'rotate', label: 'Rotate PDF', icon: RotateCw },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Tools</h1>
        <p className="text-gray-600">Merge, split, compress, and rotate your PDF documents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tools Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* File Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop PDF files here' : 'Drag & drop PDF files here'}
                </p>
                <p className="text-gray-500">
                  or click to select files
                  {activeTab === 'merge' && ' (select multiple for merging)'}
                </p>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Files:</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operation-specific options */}
              {activeTab === 'split' && files.length === 1 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Page Range</h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Start Page</label>
                      <input
                        type="number"
                        min="1"
                        value={splitRange.startPage}
                        onChange={(e) => setSplitRange(prev => ({ ...prev, startPage: parseInt(e.target.value) }))}
                        className="mt-1 block w-20 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">End Page</label>
                      <input
                        type="number"
                        min="1"
                        value={splitRange.endPage}
                        onChange={(e) => setSplitRange(prev => ({ ...prev, endPage: parseInt(e.target.value) }))}
                        className="mt-1 block w-20 px-3 py-2 border border-blue-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'rotate' && files.length === 1 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Rotation Options</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">Angle</label>
                      <select
                        value={rotateAngle}
                        onChange={(e) => setRotateAngle(parseInt(e.target.value))}
                        className="block w-full px-3 py-2 border border-green-300 rounded-md text-sm"
                      >
                        <option value={90}>90° (Clockwise)</option>
                        <option value={180}>180°</option>
                        <option value={270}>270° (Counter-clockwise)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {files.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleOperation}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Processing...' : `Process ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Operations</h3>
                <button
                  onClick={loadHistory}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <History size={16} />
                </button>
              </div>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No operations yet</p>
              ) : (
                <div className="space-y-4">
                  {history.slice(0, 5).map((operation) => (
                    <div key={operation.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {operation.operation}
                        </span>
                        <button
                          onClick={() => deleteOperation(operation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{operation.fileName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(operation.createdAt).toLocaleDateString()}
                        </span>
                        {operation.downloadUrl && (
                          <a
                            href={operation.downloadUrl}
                            download
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFTools;