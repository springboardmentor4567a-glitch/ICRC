import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import BackToDashboardButton from '../components/BackToDashboardButton';

export default function PremiumCalculator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    policyType: '',
    sumAssured: '',
    policyTerm: '',
    smokingStatus: '',
    occupationRisk: '',
    addons: []
  });
  const [errors, setErrors] = useState({});
  const [premiumResult, setPremiumResult] = useState(null);

  // Professional premium calculation function with realistic rates
  const calculatePremium = (data) => {
    const { age, policyType, sumAssured, policyTerm, smokingStatus, occupationRisk, addons } = data;
    
    // BASE RATE BY POLICY TYPE (per ₹1,000 sum assured per year)
    const baseRates = {
      Life: 0.9,
      Health: 1.2,
      Motor: 0.7,
      Home: 0.5,
      Travel: 0.4
    };
    
    // Step 1: Calculate base premium
    const basePremiumBeforeFactors = (parseFloat(sumAssured) / 1000) * baseRates[policyType];
    let basePremium = basePremiumBeforeFactors;
    
    // Step 2: AGE FACTOR
    let ageFactor;
    if (age >= 18 && age <= 25) ageFactor = 0.9;
    else if (age >= 26 && age <= 35) ageFactor = 1.0;
    else if (age >= 36 && age <= 45) ageFactor = 1.15;
    else if (age >= 46 && age <= 55) ageFactor = 1.35;
    else if (age >= 56 && age <= 70) ageFactor = 1.6;
    else ageFactor = 1.0;
    
    basePremium *= ageFactor;
    
    // Step 3: SMOKER SURCHARGE (only for Life and Health)
    let smokerFactor = 1.0;
    if ((policyType === 'Life' || policyType === 'Health') && smokingStatus === 'Smoker') {
      smokerFactor = 1.3;
    }
    basePremium *= smokerFactor;
    
    // Step 4: OCCUPATION RISK MULTIPLIER
    const occupationMultipliers = {
      Low: 1.0,
      Medium: 1.15,
      High: 1.3
    };
    const occupationMultiplier = occupationMultipliers[occupationRisk] || 1.0;
    basePremium *= occupationMultiplier;
    
    // Step 5: TERM ADJUSTMENT
    const termFactor = 1 + (parseFloat(policyTerm) / 40);
    basePremium *= termFactor;
    
    // Step 6: ADD-ON LOADINGS
    const addonLoadings = {
      'Critical Illness': 0.15,
      'Accident Cover': 0.10,
      'Hospital Cash': 0.05
    };
    
    let totalAddonPercentage = 0;
    addons.forEach(addon => {
      totalAddonPercentage += addonLoadings[addon] || 0;
    });
    
    const addonsFactor = 1 + totalAddonPercentage;
    
    // Step 7: Final calculation
    const finalAnnualPremium = Math.round(basePremium * addonsFactor);
    const monthlyPremium = Math.round(finalAnnualPremium / 12);
    
    return {
      annualPremium: finalAnnualPremium,
      monthlyPremium: monthlyPremium,
      breakdown: {
        basePremiumBeforeFactors: Math.round(basePremiumBeforeFactors),
        ageFactor,
        smokerFactor,
        occupationMultiplier,
        termFactor: Math.round(termFactor * 100) / 100,
        addonsFactor: Math.round(addonsFactor * 100) / 100
      }
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.age || formData.age < 18 || formData.age > 70) {
      newErrors.age = 'Age must be between 18 and 70';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.policyType) newErrors.policyType = 'Policy type is required';
    if (!formData.sumAssured || formData.sumAssured < 100000) {
      newErrors.sumAssured = 'Sum assured must be at least ₹1,00,000';
    }
    if (!formData.policyTerm || formData.policyTerm < 1 || formData.policyTerm > 30) {
      newErrors.policyTerm = 'Policy term must be between 1 and 30 years';
    }
    if (!formData.smokingStatus) {
      newErrors.smokingStatus = 'Smoking status is required';
    }
    if (!formData.occupationRisk) newErrors.occupationRisk = 'Occupation risk is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddonChange = (addon, checked) => {
    setFormData(prev => ({
      ...prev,
      addons: checked 
        ? [...prev.addons, addon]
        : prev.addons.filter(a => a !== addon)
    }));
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = calculatePremium(formData);
    setPremiumResult(result);
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="w-full flex items-center justify-start mb-4">
            <BackToDashboardButton />
          </div>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Premium Calculator</h1>
            <p className="text-lg text-primary/70">
              Estimate your insurance premium based on your profile and coverage needs
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              {/* Policy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <select
                    value={formData.policyType}
                    onChange={(e) => handleInputChange('policyType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select Policy Type</option>
                    <option value="Health">Health Insurance</option>
                    <option value="Life">Life Insurance</option>
                    <option value="Motor">Motor Insurance</option>
                    <option value="Home">Home Insurance</option>
                    <option value="Travel">Travel Insurance</option>
                  </select>
                  {errors.policyType && <p className="text-red-500 text-sm mt-1">{errors.policyType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sum Assured / Coverage Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    placeholder="e.g., 1000000"
                    value={formData.sumAssured}
                    onChange={(e) => handleInputChange('sumAssured', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  {errors.sumAssured && <p className="text-red-500 text-sm mt-1">{errors.sumAssured}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Term (Years) *
                  </label>
                  <select
                    value={formData.policyTerm}
                    onChange={(e) => handleInputChange('policyTerm', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select Term</option>
                    {[1,2,3,5,10,15,20,25,30].map(year => (
                      <option key={year} value={year}>{year} Year{year > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  {errors.policyTerm && <p className="text-red-500 text-sm mt-1">{errors.policyTerm}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation Risk *
                  </label>
                  <select
                    value={formData.occupationRisk}
                    onChange={(e) => handleInputChange('occupationRisk', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="">Select Risk Level</option>
                    <option value="Low">Low Risk (Office work, IT, etc.)</option>
                    <option value="Medium">Medium Risk (Sales, Teaching, etc.)</option>
                    <option value="High">High Risk (Construction, Mining, etc.)</option>
                  </select>
                  {errors.occupationRisk && <p className="text-red-500 text-sm mt-1">{errors.occupationRisk}</p>}
                </div>
              </div>

              {/* Smoking Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Smoking Status *
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="smokingStatus"
                      value="Non-Smoker"
                      checked={formData.smokingStatus === 'Non-Smoker'}
                      onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    Non-Smoker
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="smokingStatus"
                      value="Smoker"
                      checked={formData.smokingStatus === 'Smoker'}
                      onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                      className="mr-2 text-accent focus:ring-accent"
                    />
                    Smoker
                  </label>
                </div>
                {errors.smokingStatus && <p className="text-red-500 text-sm mt-1">{errors.smokingStatus}</p>}
              </div>

              {/* Add-ons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add-ons / Riders (Optional)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Critical Illness', 'Accident Cover', 'Hospital Cash'].map(addon => (
                    <label key={addon} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.addons.includes(addon)}
                        onChange={(e) => handleAddonChange(addon, e.target.checked)}
                        className="mr-2 text-accent focus:ring-accent rounded"
                      />
                      {addon}
                    </label>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating...
                    </span>
                  ) : (
                    'Calculate Premium'
                  )}
                </button>
              </div>
            </form>

            {/* Professional Results Panel */}
            {premiumResult && (
              <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                <h3 className="text-2xl font-bold text-primary mb-6">Estimated Cost</h3>
                
                {/* Premium Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Annual Cost</p>
                    <p className="text-3xl font-bold text-accent">{formatCurrency(premiumResult.annualPremium)}</p>
                    <p className="text-xs text-gray-500">per year</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
                    <p className="text-3xl font-bold text-accent">{formatCurrency(premiumResult.monthlyPremium)}</p>
                    <p className="text-xs text-gray-500">per month</p>
                  </div>
                </div>
                
                {/* Calculation Breakdown */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Cost (before factors):</span>
                      <span className="font-medium">{formatCurrency(premiumResult.breakdown.basePremiumBeforeFactors)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age Factor:</span>
                      <span className="font-medium">{premiumResult.breakdown.ageFactor}x</span>
                    </div>
                    {(formData.policyType === 'Life' || formData.policyType === 'Health') && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Smoking Factor:</span>
                        <span className="font-medium">{premiumResult.breakdown.smokerFactor}x</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation Risk:</span>
                      <span className="font-medium">{premiumResult.breakdown.occupationMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Term Factor:</span>
                      <span className="font-medium">{premiumResult.breakdown.termFactor}x</span>
                    </div>
                    {formData.addons.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Add-ons Factor:</span>
                        <span className="font-medium">{premiumResult.breakdown.addonsFactor}x</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Input Summary */}
                <div className="text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm">
                  <p className="font-medium mb-2">Based on your inputs:</p>
                  <p>
                    Age: {formData.age}, Policy Type: {formData.policyType}, 
                    Sum Assured: {formatCurrency(formData.sumAssured)}, Term: {formData.policyTerm} years, 
                    Smoking Status: {formData.smokingStatus}, Occupation Risk: {formData.occupationRisk}
                    {formData.addons.length > 0 && `, Add-ons: ${formData.addons.join(', ')}`}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}