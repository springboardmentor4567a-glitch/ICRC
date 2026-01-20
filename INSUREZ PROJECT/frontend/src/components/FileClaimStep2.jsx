import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FileClaimStep2({ onNext, onPrevious, formData, setFormData }) {
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const claimTypes = ['Accident', 'Health', 'Theft', 'Property Damage', 'Natural Disaster', 'Other'];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatCurrency = (value) => {
    return value.replace(/[^\d.]/g, '').replace(/(\.\d{2})\d+/, '$1');
  };

  // File Upload Handlers
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [formData.documents]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const processFiles = (files) => {
    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type);
      return isValidSize && isValidType;
    });

    if (formData.documents.length + validFiles.length > 10) {
      showToast('Maximum 10 files allowed', 'error');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setFormData(prev => ({ ...prev, documents: [...prev.documents, ...validFiles] }));
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.claim_type) errors.claim_type = 'Please select claim type';
    if (!formData.incident_date) errors.incident_date = 'Incident date is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.amount_requested) errors.amount_requested = 'Amount is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.documents.length === 0) errors.documents = 'At least one document is required';
    
    if (formData.incident_date && new Date(formData.incident_date) > new Date()) {
      errors.incident_date = 'Date cannot be in future';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-all group"
            >
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-primary/60">Step 2 of 3</p>
                <p className="font-semibold text-primary">Claim Details & Documents</p>
              </div>
              <div className="w-32 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-background rounded-3xl shadow-2xl border border-primary/5 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-background mb-4">
                Claim Details & Documents
              </h1>
              <p className="text-background/80 text-lg leading-relaxed">
                Provide details about the incident and upload supporting documents.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 space-y-8">
            {/* Claim Details */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Incident Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Claim Type *</label>
                  <select
                    value={formData.claim_type}
                    onChange={(e) => handleFieldChange('claim_type', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all ${
                      validationErrors.claim_type ? 'border-red-500' : formData.claim_type ? 'border-green-500' : 'border-primary/20'
                    }`}
                  >
                    <option value="">Select claim type</option>
                    {claimTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {validationErrors.claim_type && <p className="text-red-500 text-sm mt-1">{validationErrors.claim_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Incident Date *</label>
                  <input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => handleFieldChange('incident_date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all ${
                      validationErrors.incident_date ? 'border-red-500' : formData.incident_date ? 'border-green-500' : 'border-primary/20'
                    }`}
                  />
                  {validationErrors.incident_date && <p className="text-red-500 text-sm mt-1">{validationErrors.incident_date}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="Where did the incident occur?"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all ${
                    validationErrors.location ? 'border-red-500' : formData.location ? 'border-green-500' : 'border-primary/20'
                  }`}
                />
                {validationErrors.location && <p className="text-red-500 text-sm mt-1">{validationErrors.location}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">Estimated Loss Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 font-semibold">₹</span>
                  <input
                    type="text"
                    value={formData.amount_requested}
                    onChange={(e) => handleFieldChange('amount_requested', formatCurrency(e.target.value))}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all ${
                      validationErrors.amount_requested ? 'border-red-500' : formData.amount_requested ? 'border-green-500' : 'border-primary/20'
                    }`}
                  />
                </div>
                {validationErrors.amount_requested && <p className="text-red-500 text-sm mt-1">{validationErrors.amount_requested}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Description *</label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        handleFieldChange('description', e.target.value);
                      }
                    }}
                    placeholder="Describe the incident in detail..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all resize-none ${
                      validationErrors.description ? 'border-red-500' : formData.description ? 'border-green-500' : 'border-primary/20'
                    }`}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-primary/50">
                    {formData.description.length}/500
                  </div>
                </div>
                {validationErrors.description && <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>}
              </div>
            </div>

            {/* Document Upload */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Supporting Documents *</h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragOver ? 'border-accent bg-accent/5' : 'border-primary/20 hover:border-accent/50'
                }`}
              >
                <svg className="w-12 h-12 text-primary/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-primary/70 mb-2 font-medium">Drag and drop files here, or click to select</p>
                <p className="text-sm text-primary/50 mb-4">PDF, JPG, PNG • Max 10MB per file • Up to 10 files</p>
                
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => processFiles(Array.from(e.target.files))}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 cursor-pointer transition-all font-medium"
                >
                  Choose Files
                </label>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-primary/70">Uploading...</span>
                    <span className="text-sm text-primary/70">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-primary/10 rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {formData.documents.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold text-primary">Uploaded Documents ({formData.documents.length}/10)</h4>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-primary">{file.name}</p>
                          <p className="text-sm text-primary/60">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {validationErrors.documents && (
                <p className="text-red-500 text-sm mt-2">{validationErrors.documents}</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-primary/10">
              <button
                onClick={onPrevious}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <button
                onClick={handleContinue}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-accent to-accent/90 text-primary font-bold rounded-xl hover:shadow-lg hover:shadow-accent/25 transform hover:scale-105 transition-all duration-200"
              >
                <span>Continue to Review</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}