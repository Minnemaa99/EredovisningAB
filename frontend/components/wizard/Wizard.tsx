import React, { useState } from "react";
import axios from "axios";

import Step1_Rakenskapsar from "./steps/Step1_Rakenskapsar";
import Step2_Resultatrakning from "./steps/Step2_Resultatrakning";
import Step3_Balansrakning from "./steps/Step3_Balansrakning";
import Step4_Noter from "./steps/Step4_Noter";
import Step5_Forvaltningsberattelse from "./steps/Step5_Forvaltningsberattelse";
import Step6_Foretradare from "./steps/Step6_Foretradare";
import Step7_LamnaIn from "./steps/Step7_LamnaIn";

export default function Wizard() {
  // stegen i flödet
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
  const [detailedAccounts, setDetailedAccounts] = useState<any[]>([]);
  const [reportDates, setReportDates] = useState({
    start_date: "",
    end_date: "",
  });
  const [formData, setFormData] = useState<{
    income_statement: Record<string, number>;
    balance_sheet: Record<string, number>;
  }>({ income_statement: {}, balance_sheet: {} });

  const [finalReportId, setFinalReportId] = useState<number | null>(null);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  };
  const prevStep = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      company_id: 1,
      start_date: reportDates.start_date,
      end_date: reportDates.end_date,
      accounts: detailedAccounts,
    };
    try {
      const response = await axios.post(
        "/api/annual-reports/from-details",
        payload
      );
      setFinalReportId(response.data.id);
      nextStep();
    } catch (error) {
      console.error("Failed to save the report", error);
      alert("Kunde inte spara rapporten.");
    }
  };

  const handlePreview = () => {
    if (finalReportId) {
      window.open(
        `/api/annual-reports/${finalReportId}/preview`,
        "_blank"
      );
    } else {
      alert(
        "Du måste spara rapporten först för att kunna förhandsgranska den."
      );
    }
  };

  const renderStep = () => {
    switch (stepIndex) {
      case 0:
        return (
          <Step1_Rakenskapsar
            reportDates={reportDates}
            setReportDates={setReportDates}
            onNext={nextStep}
          />
        );
      case 1:
        return (
          <Step2_Resultatrakning
            formData={formData}
            accounts={detailedAccounts}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 2:
        return (
          <Step3_Balansrakning
            formData={formData}
            accounts={detailedAccounts}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return <Step4_Noter onNext={nextStep} onBack={prevStep} />;
      case 4:
        return (
          <Step5_Forvaltningsberattelse onNext={nextStep} onBack={prevStep} />
        );
      case 5:
        return <Step6_Foretradare onNext={nextStep} onBack={prevStep} />;
      case 6:
        return (
          <Step7_LamnaIn
            reportId={finalReportId}
            onSave={handleSaveAndContinue}
            onPreview={handlePreview}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      {/* Stegindikator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-sm ${
              i === stepIndex
                ? "font-bold text-blue-600"
                : i < stepIndex
                ? "text-gray-500"
                : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                i === stepIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {i + 1}
            </div>
            {label}
          </div>
        ))}
      </div>

      {/* Renderat innehåll */}
      {renderStep()}
    </div>
  );
}
