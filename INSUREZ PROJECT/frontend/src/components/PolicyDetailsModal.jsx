import { Fragment, useEffect } from 'react';

export default function PolicyDetailsModal({ policy, isOpen, onClose }) {
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !policy) return null;

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
      'Health': 'Comprehensive health coverage for individuals and families with cashless treatment at network hospitals, pre and post hospitalization expenses, and preventive health check-ups.',
      'Life': 'Secure your family\'s financial future with life protection and investment benefits. Includes term insurance, whole life, and endowment plans with tax benefits.',
      'Motor': 'Complete protection for your vehicle with comprehensive coverage including third-party liability, own damage, theft protection, and roadside assistance.',
      'Travel': 'International and domestic travel protection covering medical emergencies, trip cancellations, baggage loss, and flight delays with 24/7 assistance.',
      'Home': 'Protect your home and belongings against fire, theft, natural disasters, and other risks. Includes structure, contents, and liability coverage.',
      'Cyber': 'Digital protection against cyber threats, data breaches, identity theft, and online fraud with expert recovery assistance.'
    };
    return descriptions[policy.type] || 'Quality insurance protection tailored for your needs with comprehensive coverage and benefits.';
  };

  const getBenefits = (policyType) => {
    const benefits = {
      'Health': [
        'Cashless treatment at 10,000+ network hospitals',
        'Pre and post hospitalization coverage',
        'Day care procedures covered',
        'Annual health check-ups included',
        'No claim bonus up to 50%',
        'Maternity and newborn coverage'
      ],
      'Life': [
        'Life cover up to 100x annual income',
        'Tax benefits under Section 80C',
        'Flexible premium payment options',
        'Accidental death benefit',
        'Terminal illness coverage',
        'Loan protection facility'
      ],
      'Motor': [
        'Own damage and third-party coverage',
        '24/7 roadside assistance',
        'Cashless garage network',
        'Zero depreciation add-on available',
        'Personal accident cover for driver',
        'Engine protection coverage'
      ],
      'Travel': [
        'Medical emergency coverage worldwide',
        'Trip cancellation and interruption',
        'Baggage loss and delay protection',
        'Flight delay compensation',
        '24/7 travel assistance hotline',
        'Adventure sports coverage'
      ],
      'Home': [
        'Structure and contents protection',
        'Natural disaster coverage',
        'Theft and burglary protection',
        'Public liability coverage',
        'Temporary accommodation expenses',
        'Electronic equipment protection'
      ],
      'Cyber': [
        'Identity theft protection',
        'Cyber bullying coverage',
        'Data breach response',
        'Online fraud reimbursement',
        'Credit monitoring services',
        'Legal assistance for cyber crimes'
      ]
    };
    return benefits[policyType] || [
      'Comprehensive coverage protection',
      '24/7 customer support',
      'Easy claim process',
      'Flexible payment options',
      'Tax benefits available',
      'Renewal discounts'
    ];
  };

  const getExclusions = (policyType) => {
    const exclusions = {
      'Health': [
        'Pre-existing diseases (first 2-4 years)',
        'Cosmetic and plastic surgery',
        'Dental treatment (unless due to accident)',
        'War and nuclear risks'
      ],
      'Life': [
        'Suicide within first year',
        'Death due to intoxication',
        'War and terrorism (unless covered)',
        'Self-inflicted injuries'
      ],
      'Motor': [
        'Driving under influence',
        'Using vehicle for commercial purposes',
        'War and nuclear risks',
        'Consequential losses'
      ],
      'Travel': [
        'Pre-existing medical conditions',
        'High-risk activities (unless covered)',
        'Travel to restricted countries',
        'Pregnancy-related complications'
      ],
      'Home': [
        'War and nuclear risks',
        'Normal wear and tear',
        'Consequential losses',
        'Illegal activities'
      ],
      'Cyber': [
        'Intentional illegal activities',
        'Business-related cyber crimes',
        'Government surveillance',
        'Pre-existing identity theft'
      ]
    };
    return exclusions[policyType] || [
      'War and nuclear risks',
      'Intentional damage or fraud',
      'Pre-existing conditions',
      'Illegal activities'
    ];
  };

  return (
    <Fragment>
      {/* Backdrop with animation */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal with animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-2xl shadow-2xl border border-primary/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/90 p-6 text-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30">
                  {policy.type}
                </span>
                <span className="text-background/80 text-sm">{policy.provider}</span>
              </div>
              <button
                onClick={onClose}
                className="text-background/80 hover:text-background transition-colors p-2 hover:bg-background/10 rounded-lg"
                title="Close (ESC)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h2 className="text-3xl font-bold mt-3">{policy.name}</h2>
            <p className="text-background/90 mt-2">{getDescription(policy)}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                <div className="text-accent/60 text-sm font-medium mb-1">Coverage Amount</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(policy.coverage_amount)}
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="text-primary/60 text-sm font-medium mb-1">Annual Premium</div>
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(policy.premium)}
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="text-primary/60 text-sm font-medium mb-1">Policy Duration</div>
                <div className="text-xl font-bold text-primary">
                  {formatDuration(policy.duration_months)}
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="text-primary/60 text-sm font-medium mb-1">Provider</div>
                <div className="text-lg font-bold text-primary">
                  {policy.provider}
                </div>
              </div>
            </div>

            {/* Benefits and Exclusions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Key Benefits */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Key Benefits
                </h3>
                <div className="space-y-3">
                  {getBenefits(policy.type).map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-primary/80 text-sm leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Important Exclusions
                </h3>
                <div className="space-y-3">
                  {getExclusions(policy.type).map((exclusion, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-primary/80 text-sm leading-relaxed">{exclusion}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="flex-1 bg-accent hover:bg-accent/90 text-primary font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                Get Quote Now
              </button>
              <button className="flex-1 bg-primary hover:bg-primary/90 text-background font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                Compare Policies
              </button>
              <button 
                onClick={onClose}
                className="flex-1 bg-background hover:bg-primary/5 text-primary font-semibold py-4 px-6 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}