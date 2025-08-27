import React, { useState, useEffect } from "react";
import axios from "axios";

import Step1_Rakenskapsar from "./Step1_Rakenskapsar";
import Step2_Resultatrakning from "./Step2_Resultatrakning";
import Step3_Balansrakning from "./Step3_Balansrakning";
import Step4_Arsredovisning from "./Step4_Arsredovisning";
import Step6_Foretradare from "./Step6_Foretradare";
import Step7_LamnaIn from "./Step7_LamnaIn";

const API_URL = "http://127.0.0.1:8000/api";

// --- TRACEBACK STEG 4: Anpassad hook för att logga varje state-ändring ---
const useStateWithLogger = (initialValue, name) => {
  const [value, setValue] = useState(initialValue);

  const setValueWithLogging = (newValue) => {
    console.group(`--- TRACEBACK 4: State set for "${name}" ---`);
    console.log("Nytt värde:", newValue);
    // Kontrollera specifikt för den felande nyckeln
    if (newValue && newValue.balance_sheet && newValue.balance_sheet.solvency_ratio !== undefined) {
      console.log(`%c -> solvency_ratio FINNS`, 'color: green; font-weight: bold;');
    } else {
      console.log(`%c -> solvency_ratio SAKNAS`, 'color: red; font-weight: bold;');
    }
    console.trace("Anropades från:"); // Ger en stack trace för att se exakt varifrån anropet kom
    console.groupEnd();
    setValue(newValue);
  };

  return [value, setValueWithLogging];
};


export default function Wizard() {
  const steps = [
    "Räkenskapsår", "Resultaträkning", "Balansräkning", "Årsredovisning", "Företrädare", "Lämna in",
  ];

  const [stepIndex, setStepIndex] = useState(0);
  
  const [companyInfo, setCompanyInfo] = useState({ name: "", org_nr: "" });
  const [reportDates, setReportDates] = useState({ start_date: "", end_date: "" });
  const [accountsData, setAccountsData] = useState({ current_year: [], previous_year: [] });
  
  // --- TRACEBACK STEG 4: Använd vår nya spion-hook istället för vanlig useState ---
  const [calculationResult, setCalculationResult] = useStateWithLogger(null, "calculationResult");
  
  const [isLoading, setIsLoading] = useState(false);
  const [notesData, setNotesData] = useState({});
  const [forvaltningsberattelse, setForvaltningsberattelse] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [signatureInfo, setSignatureInfo] = useState({ city: "", date: new Date().toISOString().split('T')[0] });
  const [dividend, setDividend] = useState(0);
  const [finalReportId, setFinalReportId] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (calculationResult && stepIndex === 0) {
      nextStep();
    }
  }, [calculationResult, stepIndex]);

  const nextStep = () => { if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1); };
  const prevStep = () => { if (stepIndex > 0) setStepIndex(stepIndex - 1); };

  const handleUploadSuccess = (fullPayload) => {
    setCompanyInfo(fullPayload.company_info);
    setReportDates(fullPayload.report_dates);
    setAccountsData(fullPayload.accounts_data);
    setCalculationResult(fullPayload.k2_results); 
  };

  const handleValueChange = async (accountRange: { start: number; end: number }, newValue: number, oldValue: number) => {
    const difference = newValue - oldValue;
    if (difference === 0) return;

    setIsLoading(true);

    const isRevenueOrLiability = accountRange.start.toString().startsWith('2') || accountRange.start.toString().startsWith('3');
    const adjustmentBalance = isRevenueOrLiability ? -difference : difference;

    const adjustmentAccount = {
      account_number: `${accountRange.end}`,
      account_name: `Manuell justering - ${accountRange.start}`,
      balance: adjustmentBalance,
    };

    const updatedAccounts = {
      ...accountsData,
      current_year: [...accountsData.current_year, adjustmentAccount],
    };

    setAccountsData(updatedAccounts);

    try {
      const response = await axios.post(`${API_URL}/annual-reports/calculate`, {
        current_year: updatedAccounts.current_year,
        previous_year: updatedAccounts.previous_year,
      });
      setCalculationResult(response.data);
    } catch (error) {
      console.error("Failed to recalculate report", error.response ? error.response.data : error);
      alert("Kunde inte räkna om rapporten. Återställer ändringen.");
      setAccountsData(accountsData);
    } finally {
      setIsLoading(false);
    }
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

  const handleNotesDataChange = (noteId, data) => {
    setNotesData(prev => ({ ...prev, [noteId]: data }));
  };

  const handleDividendChange = (amount: number) => {
    setDividend(amount);
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      company_name: companyInfo.name,
      org_nr: companyInfo.org_nr,
      start_date: reportDates.start_date,
      end_date: reportDates.end_date,
      accounts_data: accountsData,
      forvaltningsberattelse: forvaltningsberattelse,
      signature_city: signatureInfo.city,
      signature_date: signatureInfo.date,
      representatives: representatives,
      dividend: dividend,
    };

    try {
      const response = await axios.post(`${API_URL}/annual-reports/from-details`, payload);
      setFinalReportId(response.data.id);
      alert("Rapporten har sparats! ID: " + response.data.id);
    } catch (error) {
      console.error("Failed to save the report", error.response ? error.response.data : error);
      alert("Kunde inte spara rapporten.");
    }
  };

  const handlePreview = () => {
    if (!finalReportId) {
      alert("Du måste spara rapporten först.");
      return;
    }
    window.open(`${API_URL}/annual-reports/${finalReportId}/preview`, "_blank");
  };

  const renderStep = () => {
    if (isLoading) {
        return <div className="text-center p-16">Räknar om...</div>;
    }

    if (stepIndex > 0 && (!calculationResult || !calculationResult.balance_sheet)) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Data saknas</h2>
                <p>Nödvändig beräkningsdata (`calculationResult`) är inte tillgänglig.</p>
                <button onClick={() => setStepIndex(0)} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Gå till start</button>
            </div>
        );
    }

    switch (stepIndex) {
      case 0: return <Step1_Rakenskapsar reportDates={reportDates} setReportDates={setReportDates} onUploadSuccess={handleUploadSuccess} onBack={prevStep} />;
      case 1: return <Step2_Resultatrakning k2Results={calculationResult} onNext={nextStep} onBack={prevStep} onValueChange={handleValueChange} />;
      case 2: return <Step3_Balansrakning k2Results={calculationResult} onNext={nextStep} onBack={prevStep} onValueChange={handleValueChange} />;
      case 3: return <Step4_Arsredovisning k2Results={calculationResult} onBack={prevStep} onNext={nextStep} onForvaltningsberattelseSave={handleForvaltningsberattelseSave} notesData={notesData} onNotesDataChange={handleNotesDataChange} dividend={dividend} onDividendChange={handleDividendChange} />;
      case 4: return <Step6_Foretradare onSave={handleForetradareSave} onBack={prevStep} />;
      case 5: return <Step7_LamnaIn onSave={handleSaveAndContinue} onPreview={handlePreview} onBack={prevStep} />;
      default: return <Step1_Rakenskapsar reportDates={reportDates} setReportDates={setReportDates} onUploadSuccess={handleUploadSuccess} onBack={prevStep} />;
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
