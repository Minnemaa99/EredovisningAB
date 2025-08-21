import React, { useState } from 'react';
import axios from 'axios';

import Step1_DataChoice from './Step1_DataChoice';
import Step2_FileUpload from './Step2_FileUpload';
import Resultatrakning from './Resultatrakning';
import Balansrakning from './Balansrakning';
import Underskrifter from './Underskrifter';
// Other steps would be imported here

// This component orchestrates the entire wizard flow
export default function Wizard() {
  const [step, setStep] = useState(0); // 0: Choice, 0.5: Upload, 1: Resultat, 2: Balans, etc.
  const [reportData, setReportData] = useState(null); // Will hold the calculated data object from SIE or be built manually

  const handleChoice = (choice) => {
    if (choice === 'manual') {
      setReportData({
        income_statement: {},
        balance_sheet: {},
      });
      setStep(1);
    } else if (choice === 'import') {
      setStep(0.5);
    }
  };

  const handleUploadSuccess = (parsedData) => {
    setReportData(parsedData);
    setStep(1);
  };

  const handleManualDataChange = (e) => {
    const { name, value, dataset } = e.target;
    const section = dataset.section; // e.g., "income_statement" or "balance_sheet"

    setReportData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  };

  const handleSaveAndFinish = async () => {
    if (!reportData) return alert("No data to save.");

    // This logic would need to be more robust to convert the form state
    // into the AccountLineIn schema for the backend.
    const account_lines = [
        ...Object.entries(reportData.income_statement).map(([k, v]) => ({ account_number: k, balance_current_year: parseFloat(v || 0) })),
        ...Object.entries(report_Data.balance_sheet).map(([k, v]) => ({ account_number: k, balance_current_year: parseFloat(v || 0) }))
    ];

    const payload = {
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      account_lines: account_lines.filter(l => !isNaN(l.balance_current_year)),
    };

    try {
      // Assuming a company with ID 1 exists for this demo
      await axios.post(`/api/annual-reports/1`, payload);
      alert("Rapport sparad!");
      setStep(step + 1); // Move to final confirmation/download screen
    } catch (error) {
      console.error("Failed to save report", error);
      alert("Kunde inte spara rapporten.");
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const renderContent = () => {
    if (step === 0) return <Step1_DataChoice onChoice={handleChoice} />;
    if (step === 0.5) return <Step2_FileUpload onUploadSuccess={handleUploadSuccess} onBack={() => setStep(0)} />;

    if (reportData) {
      switch (step) {
        case 1:
          return <Resultatrakning nextStep={nextStep} prevStep={() => setStep(0)} values={reportData.income_statement} handleChange={handleManualDataChange} />;
        case 2:
          return <Balansrakning nextStep={handleSaveAndFinish} prevStep={prevStep} values={reportData.balance_sheet} handleChange={handleManualDataChange} />;
        // The final step after saving
        case 3:
            return <div><h1>Tack!</h1><p>Din årsredovisning är sparad. Nästa steg är förhandsgranskning och betalning.</p></div>;
        default:
          return <div>Okänt steg</div>;
      }
    }
    return null;
  };

  return (
     <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Skapa Årsredovisning</h1>
      {renderContent()}
    </div>
  );
}
