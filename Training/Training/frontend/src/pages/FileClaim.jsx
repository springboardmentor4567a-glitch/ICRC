import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function FileClaim() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    policy_type: "Health",
    claim_type: "",
    claim_amount: "",
    description: "",
    incident_date: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const claimTypes = {
    Health: ["Hospitalization", "Surgery", "Medical Bills", "Emergency Treatment", "Diagnostic Tests"],
    Auto: ["Accident Damage", "Theft", "Third Party Liability", "Natural Disaster", "Vandalism"],
    Home: ["Fire Damage", "Burglary", "Natural Disaster", "Water Damage", "Structural Damage"],
    Life: ["Death Claim", "Critical Illness", "Accidental Death", "Disability", "Maturity Claim"]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} file(s) added`);
  };

  const removeDocument = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!formData.policy_type || !formData.claim_type || !formData.claim_amount) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (parseFloat(formData.claim_amount) <= 0) {
      toast.error("Claim amount must be greater than 0");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.incident_date || !formData.description) {
      toast.error("Please fill all required fields");
      return false;
    }
    if (formData.description.length < 20) {
      toast.error("Please provide a more detailed description (minimum 20 characters)");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("User not logged in");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.warning("No documents uploaded. Consider adding supporting documents.");
    }

    setLoading(true);

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      formDataToSend.append("user_id", user.id);
      formDataToSend.append("policy_type", formData.policy_type);
      formDataToSend.append("claim_type", formData.claim_type);
      formDataToSend.append("claim_amount", parseFloat(formData.claim_amount));
      formDataToSend.append("description", formData.description);
      formDataToSend.append("incident_date", formData.incident_date);
      
      // Append files
      uploadedFiles.forEach((file) => {
        formDataToSend.append("files", file);
      });

      const response = await fetch("http://localhost:8000/api/claims", {
        method: "POST",
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`✅ Claim filed successfully! Claim #${data.claim_number}`);
        
        // Show fraud analysis
        if (data.fraud_analysis) {
          const { risk_level, fraud_score } = data.fraud_analysis;
          if (risk_level === "High") {
            toast.warning(`⚠️ Fraud Risk: ${risk_level} (Score: ${fraud_score}). Your claim will be reviewed.`);
          } else {
            toast.info(`ℹ️ Fraud Risk: ${risk_level} (Score: ${fraud_score})`);
          }
        }

        if (data.uploaded_files > 0) {
          toast.success(`📎 ${data.uploaded_files} document(s) uploaded successfully`);
        }

        // Navigate to claim tracking after a delay
        setTimeout(() => {
          navigate("/track-claims");
        }, 2500);
      } else {
        toast.error(data.message || "Failed to file claim");
      }
    } catch (error) {
      toast.error("Error filing claim");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.title}>File Insurance Claim</h1>
      </div>

      <div style={styles.content}>
        {/* Form Card */}
        <div style={styles.formCard}>
          {/* Wizard Step Indicator */}
          <div style={styles.stepIndicator}>
            <div style={currentStep >= 1 ? styles.stepActive : styles.step}>
              <div style={currentStep >= 1 ? styles.stepNumberActive : styles.stepNumber}>1</div>
              <span>Claim Info</span>
            </div>
            <div style={{...styles.stepLine, backgroundColor: currentStep >= 2 ? '#00897B' : '#ddd'}}></div>
            <div style={currentStep >= 2 ? styles.stepActive : styles.step}>
              <div style={currentStep >= 2 ? styles.stepNumberActive : styles.stepNumber}>2</div>
              <span>Details</span>
            </div>
            <div style={{...styles.stepLine, backgroundColor: currentStep >= 3 ? '#00897B' : '#ddd'}}></div>
            <div style={currentStep >= 3 ? styles.stepActive : styles.step}>
              <div style={currentStep >= 3 ? styles.stepNumberActive : styles.stepNumber}>3</div>
              <span>Documents</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Claim Information */}
            {currentStep === 1 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>📋 Basic Claim Information</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Insurance Type *</label>
                  <select
                    name="policy_type"
                    value={formData.policy_type}
                    onChange={(e) => {
                      handleInputChange(e);
                      setFormData(prev => ({ ...prev, claim_type: "" }));
                    }}
                    style={styles.select}
                    required
                  >
                    <option value="Health">Health Insurance</option>
                    <option value="Auto">Auto Insurance</option>
                    <option value="Home">Home Insurance</option>
                    <option value="Life">Life Insurance</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Claim Type *</label>
                  <select
                    name="claim_type"
                    value={formData.claim_type}
                    onChange={handleInputChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Select claim type</option>
                    {claimTypes[formData.policy_type]?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Claim Amount (₹) *</label>
                  <input
                    type="number"
                    name="claim_amount"
                    value={formData.claim_amount}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter claim amount"
                    min="1"
                    required
                  />
                </div>

                <button type="button" onClick={nextStep} style={styles.nextBtn}>
                  Next Step →
                </button>
              </div>
            )}

            {/* Step 2: Incident Details */}
            {currentStep === 2 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>📝 Incident Details</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Incident Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="incident_date"
                    value={formData.incident_date}
                    onChange={handleInputChange}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    style={styles.textarea}
                    placeholder="Provide detailed description of the incident..."
                    rows="6"
                    required
                  />
                  <small style={styles.helpText}>
                    {formData.description.length} characters (minimum 20 recommended)
                  </small>
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" onClick={prevStep} style={styles.prevBtn}>
                    ← Previous
                  </button>
                  <button type="button" onClick={nextStep} style={styles.nextBtn}>
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div style={styles.stepContent}>
                <h2 style={styles.stepTitle}>📎 Upload Supporting Documents</h2>
                
                <div style={styles.formGroup}>
                  <label style={styles.label}>Upload Documents (Optional but recommended)</label>
                  <div style={styles.uploadArea}>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      style={styles.fileInput}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      id="fileUpload"
                    />
                    <label htmlFor="fileUpload" style={styles.uploadLabel}>
                      <div style={styles.uploadIcon}>📎</div>
                      <div>Click to upload or drag and drop</div>
                      <small style={styles.uploadHint}>
                        PDF, JPG, PNG, DOC (max 10MB each)
                      </small>
                    </label>
                  </div>

                  {/* Document List */}
                  {uploadedFiles.length > 0 && (
                    <div style={styles.documentList}>
                      <h4 style={styles.documentsTitle}>Uploaded Files ({uploadedFiles.length})</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} style={styles.documentItem}>
                          <div>
                            <span style={styles.documentName}>📄 {file.name}</span>
                            <small style={styles.fileSize}>
                              {(file.size / 1024).toFixed(2)} KB
                            </small>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            style={styles.removeBtn}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.infoBox}>
                  <strong>💡 Tip:</strong> Upload clear, legible copies of bills, reports, 
                  and other relevant documents to speed up claim processing.
                </div>

                <div style={styles.buttonGroup}>
                  <button type="button" onClick={prevStep} style={styles.prevBtn}>
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? "Submitting Claim..." : "🚀 Submit Claim"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Info Card */}
        <div style={styles.infoCard}>
          <h2 style={styles.infoTitle}>📋 Claim Filing Guidelines</h2>
          
          <div style={styles.infoSection}>
            <h3 style={styles.infoSubtitle}>Required Documents:</h3>
            <ul style={styles.infoList}>
              <li>Policy document copy</li>
              <li>Incident report or FIR (if applicable)</li>
              <li>Medical bills/invoices</li>
              <li>Photos of damage (if applicable)</li>
              <li>Identity proof</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.infoSubtitle}>Important Notes:</h3>
            <ul style={styles.infoList}>
              <li>Notify us within 24 hours of incident</li>
              <li>Provide accurate information</li>
              <li>Upload clear, legible documents</li>
              <li>Keep originals for verification</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.infoSubtitle}>Processing Time:</h3>
            <p style={styles.infoText}>
              Most claims are processed within 7-14 business days. 
              You'll receive status updates via email notifications.
            </p>
          </div>

          <div style={styles.fraudNotice}>
            <strong>🔒 Fraud Detection:</strong> All claims are automatically 
            screened for potential fraud using our advanced detection system.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px"
  },
  backBtn: {
    padding: "10px 20px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },
  title: {
    fontSize: "32px",
    color: "#333",
    margin: 0
  },
  content: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  formCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px"
  },
  step: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: "#666"
  },
  stepNumber: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#00897B",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600"
  },
  stepLine: {
    flex: 1,
    height: "2px",
    backgroundColor: "#ddd",
    margin: "0 10px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box"
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    backgroundColor: "#fff"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "2px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    resize: "vertical"
  },
  helpText: {
    display: "block",
    fontSize: "12px",
    color: "#666",
    marginTop: "5px"
  },
  uploadArea: {
    position: "relative",
    marginTop: "10px"
  },
  fileInput: {
    display: "none"
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    border: "2px dashed #00897B",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  uploadIcon: {
    fontSize: "48px",
    marginBottom: "10px"
  },
  uploadHint: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px"
  },
  documentList: {
    marginTop: "15px"
  },
  documentItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
    marginBottom: "8px"
  },
  documentName: {
    fontSize: "14px",
    color: "#333"
  },
  removeBtn: {
    padding: "4px 8px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  submitBtn: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#00897B",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    transition: "background-color 0.3s"
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    height: "fit-content"
  },
  infoTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginTop: 0,
    marginBottom: "20px"
  },
  infoSection: {
    marginBottom: "25px"
  },
  infoSubtitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#00897B",
    marginBottom: "10px"
  },
  infoList: {
    margin: 0,
    paddingLeft: "20px",
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.8"
  },
  infoText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0
  },
  fraudNotice: {
    padding: "15px",
    backgroundColor: "#fff3cd",
    borderLeft: "4px solid #ffc107",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#856404",
    lineHeight: "1.6"
  }
};
