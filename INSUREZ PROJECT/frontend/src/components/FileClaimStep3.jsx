import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsAPI } from '../api/client';
import axios from 'axios';

export default function FileClaimStep3({ onPrevious, formData, onSubmitSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [contactPhone, setContactPhone] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSelectedPolicy();
  }, [formData.policy_id]);

  const fetchSelectedPolicy = async () => {
    if (!formData.policy_id) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://127.0.0.1:8000/policies', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const policy = response.data.find(p => p.id === parseInt(formData.policy_id));
      setSelectedPolicy(policy);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 SUBMIT START - Bulletproof version');
    
    // GUARANTEED STATE LOCK - NEVER FAILS TO RESET
    setSubmitting(true);
    setValidationError('');
    
    // TIMEOUT CONTROLLER - 10 SECOND MAXIMUM
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT TRIGGERED - Aborting request');
      controller.abort();
    }, 10000);

    try {
      // STEP 1: Basic validation
      if (!contactPhone.trim()) {
        throw new Error('Phone number is required');
      }

      if (!formData.policy_id || !formData.claim_type || !formData.incident_date || 
          !formData.location || !formData.amount_requested || !formData.description) {
        throw new Error('Please complete all required fields in previous steps');
      }

      // STEP 2: Clean amount
      const cleanAmount = formData.amount_requested.toString().replace(/[^0-9.]/g, '');
      const amount = parseFloat(cleanAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount in previous step');
      }

      // STEP 3: Check token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Please login again');
      }

      console.log('📋 Form data valid, preparing submission...');

      // STEP 4: Prepare payload
      const payload = {
        policy_id: parseInt(formData.policy_id),
        claim_type: formData.claim_type,
        incident_date: formData.incident_date,
        location: formData.location.trim(),
        amount_requested: amount,
        description: formData.description.trim()
      };
      
      console.log('📤 SENDING:', payload);

      // STEP 5: Make request with timeout
      const response = await fetch('http://127.0.0.1:8000/claims/', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 RESPONSE STATUS:', response.status);

      // STEP 6: Parse response
      const data = await response.json();
      console.log('📥 RESPONSE DATA:', data);

      // STEP 7: Check success
      if (!response.ok) {
        let errorMsg = 'Submit failed';
        
        if (response.status === 401) {
          errorMsg = 'Session expired - please login again';
          localStorage.removeItem('accessToken');
          setTimeout(() => navigate('/login'), 2000);
        } else if (response.status === 422) {
          errorMsg = 'Validation error: ' + (data.detail || 'Invalid data');
          if (Array.isArray(data.detail)) {
            errorMsg = data.detail.map(err => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          }
        } else if (data.detail) {
          errorMsg = data.detail;
        } else {
          errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMsg);
      }

      // STEP 8: SUCCESS!
      console.log('✅ CLAIM SUBMITTED SUCCESSFULLY!');
      localStorage.removeItem('claimDraft');
      
      // Extract claim ID and call success callback
      const claimId = data.claim_id || data.id || data.claimId || 'UNKNOWN';
      onSubmitSuccess(claimId);
      
    } catch (error) {
      console.error('❌ SUBMISSION ERROR:', error);
      
      let userMessage = error.message;
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        userMessage = 'Request timeout (10s) - please try again';
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        userMessage = 'Cannot connect to server - check if backend is running on http://127.0.0.1:8000';
      } else if (!userMessage || userMessage === 'Failed to fetch') {
        userMessage = 'Network error - please check your connection';
      }
      
      setValidationError(userMessage);
      
    } finally {
      // GUARANTEED CLEANUP - SPINNER ALWAYS STOPS
      console.log('🏁 CLEANUP - Clearing timeout and resetting state');
      clearTimeout(timeoutId);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
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
                <p className="text-sm text-primary/60">Step 3 of 3</p>
                <p className="font-semibold text-primary">Review & Submit</p>
              </div>
              <div className="w-32 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-background rounded-3xl shadow-2xl border border-primary/5 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/90 px-8 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold text-background mb-4">
                Review & Submit Claim
              </h1>
              <p className="text-background/80 text-lg leading-relaxed">
                Review your claim details and submit for processing.
              </p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="bg-primary/5 rounded-xl p-6">
              <h3 className="font-semibold text-primary mb-4">Contact Information</h3>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => {
                    setContactPhone(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder="+91 9876543210"
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-background focus:ring-2 focus:ring-accent transition-all ${
                    validationError ? 'border-red-500' : contactPhone ? 'border-green-500' : 'border-primary/20'
                  }`}
                />
                {validationError && <p className="text-red-500 text-sm mt-1">{validationError}</p>}
              </div>
            </div>

            <div className="bg-background border border-primary/10 rounded-xl p-6 space-y-6">
              <h3 className="font-semibold text-primary text-lg">Claim Summary</h3>
              
              <div>
                <h4 className="font-medium text-primary mb-3">Selected Policy</h4>
                {selectedPolicy ? (
                  <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-primary/60">Policy Name:</span>
                        <p className="font-medium text-primary">{selectedPolicy.name}</p>
                      </div>
                      <div>
                        <span className="text-primary/60">Provider:</span>
                        <p className="font-medium text-primary">{selectedPolicy.provider}</p>
                      </div>
                      <div>
                        <span className="text-primary/60">Type:</span>
                        <p className="font-medium text-primary">{selectedPolicy.type}</p>
                      </div>
                      <div>
                        <span className="text-primary/60">Premium:</span>
                        <p className="font-medium text-accent">₹{selectedPolicy.premium?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-primary/60">Loading policy details...</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-3">Claim Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-primary/50">Type:</span>
                    <p className="text-primary font-medium">{formData.claim_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-primary/50">Date:</span>
                    <p className="text-primary font-medium">{formData.incident_date}</p>
                  </div>
                  <div>
                    <span className="text-sm text-primary/50">Location:</span>
                    <p className="text-primary font-medium">{formData.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-primary/50">Amount:</span>
                    <p className="text-primary font-medium">₹{formData.amount_requested}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-primary/50">Description:</span>
                  <p className="text-primary mt-1 bg-primary/5 p-3 rounded-lg">{formData.description}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-primary mb-3">Supporting Documents</h4>
                <div className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                      <div className="w-8 h-8 bg-accent/10 rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary">{file.name}</p>
                        <p className="text-xs text-primary/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-primary/60 text-sm mt-2">{formData.documents.length} file(s) uploaded</p>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6">
              <h4 className="font-medium text-primary mb-3">Terms & Conditions</h4>
              <div className="text-sm text-primary/70 space-y-2">
                <p>• I confirm that all information provided is accurate and complete.</p>
                <p>• I understand that false information may result in claim rejection.</p>
                <p>• I authorize the insurance company to investigate this claim.</p>
                <p>• Processing time is typically 7-14 business days.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-primary/10">
              <button
                onClick={onPrevious}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-3 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || !contactPhone.trim()}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting Claim...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Claim</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}