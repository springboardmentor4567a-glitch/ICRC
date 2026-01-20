import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FileClaimSuccess({ claimId }) {
  const [checkmarkScale, setCheckmarkScale] = useState(false);
  const [slideUp, setSlideUp] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clean animation sequence
    setTimeout(() => setCheckmarkScale(true), 100);
    setTimeout(() => setSlideUp(true), 200);
    setTimeout(() => setShowButtons(true), 400);
  }, []);

  const copyClaimId = () => {
    navigator.clipboard.writeText(claimId);
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = 'Claim ID copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
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
                <p className="text-sm text-primary/60">Claim Submitted</p>
                <p className="font-semibold text-primary">Success!</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-background rounded-3xl shadow-2xl border border-primary/10 overflow-hidden">
          {/* Success Hero Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-center">
            <div className="max-w-2xl mx-auto">
              {/* Clean Checkmark Animation */}
              <div className={`w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform duration-500 ${
                checkmarkScale ? 'scale-100' : 'scale-0'
              }`}>
                <svg className="w-12 h-12 text-accent animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationIterationCount: 2 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                Claim Submitted Successfully!
              </h1>
              <p className="text-white/90 text-lg">
                Your insurance claim has been submitted and is now being processed.
              </p>
            </div>
          </div>

          {/* Claim Details */}
          <div className={`p-8 space-y-8 transition-all duration-300 ${
            slideUp ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            {/* Claim ID Section */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 border-2 border-accent/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Your Claim ID</h2>
                <div className="flex items-center justify-center space-x-4">
                  <div className="bg-accent/20 text-primary px-6 py-4 rounded-xl font-mono text-2xl font-bold tracking-wider border-2 border-accent/30">
                    {claimId}
                  </div>
                  <button
                    onClick={copyClaimId}
                    className="p-3 bg-accent text-primary rounded-xl hover:bg-accent/90 transition-all"
                    title="Copy Claim ID"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <p className="text-primary/60 mt-4 font-medium">
                  Save this Claim ID for future reference and tracking.
                </p>
              </div>
            </div>

            {/* Status Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">⏳ Processing</h3>
                </div>
                <p className="text-primary/70">
                  Your claim will be reviewed within <strong className="text-primary">7-14 business days</strong>.
                </p>
              </div>

              <div className="bg-accent/5 rounded-xl p-6 border border-accent/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-primary text-lg">📧 Stay Updated</h3>
                </div>
                <p className="text-primary/70">
                  Don't worry! We'll send status updates via email.
                </p>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-background border-2 border-primary/10 rounded-xl p-6">
              <h3 className="font-semibold text-primary mb-4 flex items-center space-x-2 text-lg">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Important Information</span>
              </h3>
              <div className="space-y-3 text-primary/70">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-primary">Keep Claim ID for reference:</strong> Save <span className="font-mono text-primary">{claimId}</span> for future tracking.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-primary">Contact for additional information:</strong> Our claims team may reach out if needed.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-primary">Track your claim:</strong> Visit the Claim Status Tracking page for real-time updates.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p><strong className="text-primary">Secure documents:</strong> All uploaded files are safely stored and encrypted.</p>
                </div>
              </div>
            </div>

            {/* Action Buttons with Fade-in */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-500 ${
              showButtons ? 'opacity-100' : 'opacity-0'
            }`}>
              <button
                onClick={() => navigate('/claim-status')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-accent text-primary rounded-xl hover:bg-accent/90 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>View Claims</span>
              </button>

              <button
                onClick={() => navigate('/claims')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-primary text-background rounded-xl hover:bg-primary/90 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>File Another Claim</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center space-x-2 px-8 py-4 border-2 border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-all font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}