import React, { useState } from 'react';
import axios from 'axios';

import Step1_DataChoice from './Step1_DataChoice';
import Step2_FileUpload from './Step2_FileUpload';
import ReviewSieData from './ReviewSieData';
import FinalStep from './FinalStep'; // Assuming a final step component exists

export default function Wizard() {
  const [step, setStep] = useState(0); // 0: Choice, 0.5: Upload, 1: Review, 2: Final

  // State for the new SIE workflow
  const [detailedAccounts, setDetailedAccounts] = useState([]);
  const [reportDates, setReportDates] = useState({ start_date: '', end_date: '' });

  // We'll keep the old reportId for the final step
  const [finalReportId, setFinalReportId] = useState(null);

  const handleChoice = (choice) => {
    if (choice === 'manual') {
      alert("Manuell inmatning är inte implementerad i denna version.");
      // In a real app, this would trigger the manual form flow.
    } else if (choice === 'import') {
      setStep(0.5);
    }
  };

  const handleUploadSuccess = (sieParseResult) => {
    setDetailedAccounts(sieParseResult.accounts || []);
    setReportDates({
      start_date: sieParseResult.start_date,
      end_date: sieParseResult.end_date,
    });
    setStep(1); // Go to the new review step
  };

  const handleAccountChange = (index, newBalance) => {
    const updatedAccounts = [...detailedAccounts];
    updatedAccounts[index] = {
      ...updatedAccounts[index],
      balance: parseFloat(newBalance) || 0,
    };
    setDetailedAccounts(updatedAccounts);
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      company_id: 1, // Assuming company 1 for this demo
      start_date: reportDates.start_date,
      end_date: reportDates.end_date,
      accounts: detailedAccounts,
    };

    try {
      const response = await axios.post('/api/annual-reports/from-details', payload);
      setFinalReportId(response.data.id);
      alert("Rapporten har sparats!");
      setStep(2); // Move to a final step
    } catch (error) {
      console.error("Failed to save the report", error);
      alert("Kunde inte spara rapporten.");
    }
  };

  const handlePreview = () => {
    if (finalReportId) {
      window.open(`/api/annual-reports/${finalReportId}/preview`, '_blank');
    } else {
      alert("Du måste spara rapporten först för att kunna förhandsgranska den.");
    }
  };

  const renderContent = () => {
    switch (step) {
      case 0:
        return <Step1_DataChoice onChoice={handleChoice} />;
      case 0.5:
        return <Step2_FileUpload onUploadSuccess={handleUploadSuccess} onBack={() => setStep(0)} />;
      case 1:
        return (
          <ReviewSieData
            accounts={detailedAccounts}
            onAccountChange={handleAccountChange}
            onBack={() => setStep(0.5)}
            onNext={handleSaveAndContinue}
          />
        );
      case 2:
        return <FinalStep reportId={finalReportId} onRestart={() => {
            setStep(0);
            setDetailedAccounts([]);
            setReportDates({ start_date: '', end_date: '' });
            setFinalReportId(null);
        }} />;
      default:
        return null;
    }
  };

  return (
     <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Skapa Årsredovisning</h1>
        <button
          onClick={handlePreview}
          disabled={!finalReportId}
          className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 disabled:opacity-50"
        >
          Visa PDF-utkast
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
