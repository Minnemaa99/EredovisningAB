import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Step1_DataChoice from './Step1_DataChoice';
import Step2_FileUpload from './Step2_FileUpload';
import Resultatrakning from './Resultatrakning';
import Balansrakning from './Balansrakning';
// ... other steps

export default function Wizard() {
  const [step, setStep] = useState(0); // 0: Choice, 0.5: Upload, 1: Forms
  const [reportId, setReportId] = useState(null);
  const [formData, setFormData] = useState({
    income_statement: {},
    balance_sheet: {},
  });

  const createReport = async () => {
    try {
      // Assuming company 1 for this demo
      const response = await axios.post('/api/annual-reports?company_id=1');
      setReportId(response.data.id);
      return response.data.id;
    } catch (error) {
      alert('Kunde inte starta en ny rapport.');
      return null;
    }
  };

  const handleChoice = async (choice) => {
    const newReportId = await createReport();
    if (!newReportId) return;

    if (choice === 'manual') {
      setStep(1);
    } else if (choice === 'import') {
      setStep(0.5);
    }
  };

  const handleUploadSuccess = (parsedData) => {
    setFormData({
        income_statement: parsedData.income_statement,
        balance_sheet: parsedData.balance_sheet,
    });
    setStep(1); // Go to the first form for review
  };

  const handleChange = (e) => {
    const { name, value, dataset } = e.target;
    const section = dataset.section;
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [name]: value }
    }));
  };

  const handleSaveProgress = async () => {
    const account_lines = [
      ...Object.entries(formData.income_statement).map(([k, v]) => ({ account_number: k, balance_current_year: parseFloat(v || 0) })),
      ...Object.entries(formData.balance_sheet).map(([k, v]) => ({ account_number: k, balance_current_year: parseFloat(v || 0) }))
    ];
    const payload = {
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      account_lines: account_lines.filter(l => !isNaN(l.balance_current_year)),
    };
    try {
      await axios.put(`/api/annual-reports/${reportId}`, payload);
      alert("Framsteg sparat!");
    } catch (error) {
      alert("Kunde inte spara framsteg.");
    }
  };

  const handlePreview = () => {
    if (reportId) {
      window.open(`/api/annual-reports/${reportId}/preview`, '_blank');
    } else {
      alert("Starta en rapport först.");
    }
  };

  const renderContent = () => {
    if (step === 0) return <Step1_DataChoice onChoice={handleChoice} />;
    if (step === 0.5) return <Step2_FileUpload onUploadSuccess={handleUploadSuccess} onBack={() => setStep(0)} />;
    if (step >= 1) {
      return (
        <div>
          {/* Now we show the forms, which are just editors for the formData state */}
          <Resultatrakning values={formData.income_statement} handleChange={handleChange} />
          <Balansrakning values={formData.balance_sheet} handleChange={handleChange} />
          {/* In a real app, these would be separate steps */}
        </div>
      );
    }
    return null;
  };

  return (
     <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Skapa Årsredovisning</h1>
        <button
          onClick={handlePreview}
          disabled={!reportId}
          className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 disabled:opacity-50"
        >
          Visa PDF-utkast
        </button>
      </div>
      {renderContent()}
       {step >= 1 && (
        <div className="mt-8 flex justify-end">
            <button onClick={handleSaveProgress} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">
                Spara & Fortsätt
            </button>
        </div>
       )}
    </div>
  );
}
