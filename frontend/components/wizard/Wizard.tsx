import React, { useState, useEffect } from "react";
import axios from "axios";

import Step1_Rakenskapsar from "./Step1_Rakenskapsar";
import Step2_Resultatrakning from "./Step2_Resultatrakning";
import Step3_Balansrakning from "./Step3_Balansrakning";
import Step4_Noter from "./Step4_Noter";
import Step5_Forvaltningsberattelse from "./Step5_Forvaltningsberattelse";
import Step6_Foretradare from "./Step6_Foretradare";
import Step7_LamnaIn from "./Step7_LamnaIn";

const API_URL = "http://127.0.0.1:8000/api";

export default function Wizard() {
  const steps = [
    "Räkenskapsår",
    "Resultaträkning",
    "Balansräkning",
    "Noter",
    "Förvaltningsberättelse",
    "Företrädare",
    "Lämna in",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  
  // --- NY STATE-HANTERING ---
  const [companyInfo, setCompanyInfo] = useState({ name: "", org_nr: "" });
  const [reportDates, setReportDates] = useState({ start_date: "", end_date: "" });
  // Rådata för konton, detta är vår "source of truth" för att kunna göra omberäkningar
  const [accountsData, setAccountsData] = useState({ current_year: [], previous_year: [] });
  // Det färdigberäknade resultatet från backend
  const [calculationResult, setCalculationResult] = useState(null);

  const [forvaltningsberattelse, setForvaltningsberattelse] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [signatureInfo, setSignatureInfo] = useState({ city: "", date: new Date().toISOString().split('T')[0] });
  
  const [finalReportId, setFinalReportId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const nextStep = () => { if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1); };
  const prevStep = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1); };

  const handleUploadSuccess = (fullPayload) => {
    console.log("Full Payload Received in Wizard:", fullPayload);
    setCompanyInfo(fullPayload.company_info);
    setReportDates(fullPayload.report_dates);
    setAccountsData(fullPayload.accounts_data);
    setCalculationResult(fullPayload.k2_results);
    
    nextStep();
  };

  const handleForvaltningsberattelseSave = (text) => {
    setForvaltningsberattelse(text);
    nextStep();
  };

  const handleForetradareSave = (reps, sigInfo) => {
    setRepresentatives(reps);
    setSignatureInfo(sigInfo);
    nextStep();
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      company_name: companyInfo.name,
      org_nr: companyInfo.org_nr,
      start_date: reportDates.start_date,
      end_date: reportDates.end_date,
      accounts_data: accountsData, // Skicka den sparade rådatan
      forvaltningsberattelse: forvaltningsberattelse,
      signature_city: signatureInfo.city,
      signature_date: signatureInfo.date,
      representatives: representatives,
    };

    console.log("Sending complete payload to backend:", payload);

    try {
      const response = await axios.post(`${API_URL}/annual-reports/from-details`, payload);
      setFinalReportId(response.data.id);
      alert("Rapporten har sparats! ID: " + response.data.id + ". Du kan nu förhandsgranska.");
    } catch (error) {
      console.error("Failed to save the report", error.response ? error.response.data : error);
      alert("Kunde inte spara rapporten. Kontrollera konsolen för felmeddelanden.");
    }
  };

  const handlePreview = () => {
    if (!finalReportId) {
      alert("Du måste spara rapporten först innan du kan förhandsgranska.");
      return;
    }
    window.open(`${API_URL}/annual-reports/${finalReportId}/preview`, "_blank");
  };

  const renderStep = () => {
    // Säkerställ att vi har data innan vi renderar stegen som behöver den
    if (stepIndex > 0 && !calculationResult) {
        return <div>Laddar data...</div>;
    }

    switch (stepIndex) {
      case 0:
        return (
          <Step1_Rakenskapsar
            reportDates={reportDates}
            setReportDates={setReportDates}
            onUploadSuccess={handleUploadSuccess}
            onBack={prevStep}
          />
        );
      case 1:
        return (
          <Step2_Resultatrakning
            k2Results={calculationResult}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <Step3_Balansrakning
            k2Results={calculationResult}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step4_Noter
            k2Results={calculationResult} // Skicka färdigberäknad data
            onBack={prevStep}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <Step5_Forvaltningsberattelse
            k2Results={calculationResult} // Skicka färdigberäknad data
            onSave={handleForvaltningsberattelseSave} // Behöver en onSave-prop
            onBack={prevStep}
          />
        );
      case 5:
        return <Step6_Foretradare onSave={handleForetradareSave} onBack={prevStep} />;
      case 6:
        return (
          <Step7_LamnaIn
            onSave={handleSaveAndContinue}
            onPreview={handlePreview}
            onBack={prevStep}
          />
        );
      default:
        return (
          <Step1_Rakenskapsar
            reportDates={reportDates}
            setReportDates={setReportDates}
            onUploadSuccess={handleUploadSuccess}
            onBack={prevStep}
          />
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div key={i} className={`flex-1 text-center text-sm ${i === stepIndex ? "font-bold text-blue-600" : i < stepIndex ? "text-gray-500" : "text-gray-400"}`}>
            <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${i === stepIndex ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {i + 1}
            </div>
            {label}
          </div>
        ))}
      </div>
      {isClient ? renderStep() : <div>Laddar komponent...</div>}
    </div>
  );
}
