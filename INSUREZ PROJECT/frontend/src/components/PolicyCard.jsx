export default function PolicyCard({ policy, onViewDetails, onRequestQuote }) {
  const formatCurrency = (amount) => {
    return amount ? `₹${Number(amount).toLocaleString()}` : 'N/A';
  };

  const formatDuration = (months) => {
    if (!months) return 'N/A';
    const years = Math.floor(months / 12);
    return years >= 1 ? `${years} year${years > 1 ? 's' : ''}` : `${months} months`;
  };

  const getDescription = (policy) => {
    const descriptions = {
      'Health': 'Comprehensive health coverage for individuals and families.',
      'Life': 'Secure your family\'s financial future with life protection.',
      'Motor': 'Complete protection for your vehicle with comprehensive coverage.',
      'Travel': 'International and domestic travel protection.',
      'Home': 'Protect your home and belongings against various risks.',
      'Cyber': 'Digital protection against cyber threats and online fraud.'
    };
    return descriptions[policy.type] || 'Quality insurance protection tailored for you.';
  };

  return (
    <div className="bg-background rounded-xl p-6 border border-primary/10 hover:border-accent/30 hover:shadow-xl transition-all duration-300 shadow-lg">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
            {policy.type || 'Insurance'}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-primary/50 text-xs">{policy.provider}</span>
            {/* Quote Icon */}
            <button
              onClick={() => onRequestQuote(policy)}
              className="p-1 text-accent hover:text-accent/80 hover:bg-accent/10 rounded transition-colors"
              title="Request Quote"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,17H7L2,22V4A2,2 0 0,1 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L14,17Z" />
              </svg>
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold text-primary mb-2">{policy.name}</h3>
        <p className="text-primary/60 text-sm leading-relaxed">
          {getDescription(policy)}
        </p>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-primary/60 text-sm">Coverage:</span>
          <span className="text-primary font-semibold">
            {formatCurrency(policy.coverage_amount)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-primary/60 text-sm">Premium:</span>
          <span className="text-accent font-bold">
            {formatCurrency(policy.premium)}/yr
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-primary/60 text-sm">Duration:</span>
          <span className="text-primary font-medium">
            {formatDuration(policy.duration_months)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onViewDetails(policy)}
        className="w-full bg-primary hover:bg-primary/90 text-background font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg"
      >
        View Details
      </button>
    </div>
  );
}