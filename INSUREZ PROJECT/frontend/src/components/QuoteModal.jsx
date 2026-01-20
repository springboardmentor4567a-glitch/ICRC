import { useState } from 'react';

export default function QuoteModal({ policy, isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(policy, formData);
    setFormData({ fullName: '', email: '', phone: '', notes: '' });
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${Number(amount).toLocaleString()}` : 'N/A';
  };

  const formatDuration = (months) => {
    if (!months) return 'N/A';
    const years = Math.floor(months / 12);
    return years >= 1 ? `${years} year${years > 1 ? 's' : ''}` : `${months} months`;
  };

  if (!isOpen || !policy) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Quoted Policy Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quoted Policy Details Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg p-4 border border-primary/10">
              <h3 className="text-lg font-bold text-primary mb-4">{policy.name}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Policy Type:</span>
                  <span className="text-sm font-semibold text-primary">{policy.type}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Provider:</span>
                  <span className="text-sm font-semibold text-primary">{policy.provider}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Coverage Amount:</span>
                  <span className="text-sm font-bold text-accent">{formatCurrency(policy.coverage_amount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Premium:</span>
                  <span className="text-sm font-bold text-accent">{formatCurrency(policy.premium)}/year</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Duration:</span>
                  <span className="text-sm font-semibold text-primary">{formatDuration(policy.duration_months)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quote Request Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <h4 className="text-lg font-semibold text-primary mb-4">Request Quote for This Policy</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  placeholder="Any specific requirements or questions..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Confirm Quote Request
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}