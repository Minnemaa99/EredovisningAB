import { useState } from 'react';
import Step1_CompanyInfo from './wizard/Step1_CompanyInfo';
import Step2_DataImport from './wizard/Step2_DataImport';

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    orgnummer: '',
    // ... other fields will be added here
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1_CompanyInfo
            nextStep={nextStep}
            handleChange={handleChange}
            values={formData}
          />
        );
      case 2:
        return <Step2_DataImport nextStep={nextStep} prevStep={prevStep} />;
      default:
        return <div>Steg {step}</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Steg {step} av 5</h2>
      {renderStep()}
    </div>
  );
}
