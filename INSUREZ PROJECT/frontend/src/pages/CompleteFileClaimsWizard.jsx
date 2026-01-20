import { useState, useEffect } from 'react';
import FileClaimStep1 from '../components/FileClaimStep1';
import FileClaimStep2 from '../components/FileClaimStep2';
import FileClaimStep3 from '../components/FileClaimStep3';
import FileClaimSuccess from '../components/FileClaimSuccess';

export default function CompleteFileClaimsWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [claimId, setClaimId] = useState('');
  const [formData, setFormData] = useState({
    policy_id: '',
    claim_type: '',
    incident_date: '',
    location: '',
    amount_requested: '',
    description: '',
    documents: []
  });

  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('claimDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...draftData }));
        setCurrentStep(draftData.step || 1);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitSuccess = (generatedClaimId) => {
    setClaimId(generatedClaimId);
    setCurrentStep(4);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FileClaimStep1
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        );
      
      case 2:
        return (
          <FileClaimStep2
            onNext={handleNext}
            onPrevious={handlePrevious}
            formData={formData}
            setFormData={setFormData}
          />
        );
      
      case 3:
        return (
          <FileClaimStep3
            onPrevious={handlePrevious}
            formData={formData}
            onSubmitSuccess={handleSubmitSuccess}
          />
        );
      
      case 4:
        return (
          <FileClaimSuccess claimId={claimId} />
        );
      
      default:
        return (
          <FileClaimStep1
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        );
    }
  };

  return (
    <div>
      {renderCurrentStep()}
    </div>
  );
}