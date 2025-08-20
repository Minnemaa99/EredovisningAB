import { useState } from 'react';
import Step1_CompanyInfo from './wizard/Step1_CompanyInfo';
import Step2_DataImport from './wizard/Step2_DataImport';
import Step3_Validation from './wizard/Step3_Validation';
import Step4_Preview from './wizard/Step4_Preview';
import Step5_Payment from './wizard/Step5_Payment';
import Step2_ManualEntry from './wizard/Step2_ManualEntry';
import Step2_FileUpload from './wizard/Step2_FileUpload';

import axios from 'axios';

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [dataImportMethod, setDataImportMethod] = useState(null); // 'import' or 'manual'
  const [formData, setFormData] = useState({
    companyName: '',
    orgnummer: '',
    // This will be populated after step 1
    companyId: null,
    reportId: null,
  });

  const nextStep = async () => {
    // When moving from step 1 to 2, create the company and report
    if (step === 1) {
      try {
        // This is a simplified flow. A real app would have user accounts.
        // We'll create a placeholder user and company.
        // In a real app, you would likely select an existing company.

        // For now, let's assume a company and user exist and we just create the report.
        // This part needs a more robust implementation in a real app.
        // We'll mock the company creation and assume companyId is 1.

        const reportResponse = await axios.post('/api/annual-reports/', {
          year: new Date().getFullYear(),
          company_id: 1, // Mock company ID
        });

        setFormData({ ...formData, reportId: reportResponse.data.id });

      } catch (error) {
        console.error("Failed to create annual report", error);
        // Don't proceed if the backend call fails
        return;
      }
    }
    setStep(prev => prev + 1);
  };
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
        if (!dataImportMethod) {
          return <Step2_DataImport setImportMethod={setDataImportMethod} prevStep={prevStep} />;
        }
        if (dataImportMethod === 'manual') {
          return <Step2_ManualEntry onSave={(data) => console.log(data)} onBack={() => setDataImportMethod(null)} />;
        }
        if (dataImportMethod === 'import') {
          return <Step2_FileUpload nextStep={nextStep} onBack={() => setDataImportMethod(null)} reportId={formData.reportId} />;
        }
        return null; // Should not happen
      case 3:
        return <Step3_Validation nextStep={nextStep} prevStep={prevStep} reportId={formData.reportId} />;
      case 4:
        return <Step4_Preview nextStep={nextStep} prevStep={prevStep} reportId={formData.reportId} />;
      case 5:
        return <Step5_Payment prevStep={prevStep} reportId={formData.reportId} />;
      case 5:
        return <Step5_Payment prevStep={prevStep} reportId={formData.reportId} />;
      default:
        return <div>Färdig!</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Steg {step} av 5</h2>
      {renderStep()}
    </div>
  );
}
