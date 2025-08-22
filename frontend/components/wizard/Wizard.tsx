import React, { useState } from 'react';
import axios from 'axios';

import Step1_DataChoice from './Step1_DataChoice';
import Step2_FileUpload from './Step2_FileUpload';
import ReviewSieData from './ReviewSieData';
import FinalStep from './FinalStep'; // Assuming a final step component exists

export default function Wizard() {
  const [step, setStep] = useState("choice"); // "choice" | "upload" | "review" | "final"

  // State for the new SIE workflow
  const [detailedAccounts, setDetailedAccounts] = useState([]);
  const [reportDates, setReportDates] = useState({ start_date: '', end_date: '' });
  const [formData, setFormData] = useState({ income_statement: {}, balance_sheet: {} });

  // We'll keep the old reportId for the final step
  const [finalReportId, setFinalReportId] = useState(null);

  const handleChoice = (choice) => {
    if (choice === 'manual') {
      alert("Manuell inmatning är inte implementerad i denna version.");
    } else if (choice === 'import') {
      setStep("upload");
    }
  };

  const handleUploadSuccess = (sieParseResult) => {
    const accounts = sieParseResult.accounts || [];
    setDetailedAccounts(accounts);
    setReportDates({
      start_date: sieParseResult.start_date,
      end_date: sieParseResult.end_date,
    });

    // --- Perform aggregation ---
    const summary = {};
    const fields = [
      "bs_materiella_anlaggningstillgangar","bs_finansiella_anlaggningstillgangar",
      "bs_varulager","bs_kundfordringar","bs_ovriga_fordringar","bs_forutbetalda_kostnader",
      "bs_kassa_bank","bs_bundet_eget_kapital","bs_fritt_eget_kapital","bs_obeskattade_reserver",
      "bs_langfristiga_skulder","bs_kortfristiga_skulder","is_nettoomsattning","is_forandring_lager",
      "is_ovriga_rorelseintakter","is_kostnad_ravaror","is_kostnad_externa","is_kostnad_personal",
      "is_avskrivningar","is_finansiella_intakter","is_finansiella_kostnader","is_bokslutsdispositioner",
      "is_skatt"
    ];
    fields.forEach(field => summary[field] = 0.0);

    accounts.forEach(account => {
      const account_num = parseInt(account.account_number, 10);
      const balance = parseFloat(account.balance) || 0;

      if (isNaN(account_num)) return;

      let schema_field = null;
      // Balance Sheet Accounts
      if (1200 <= account_num && account_num < 1300) schema_field = "bs_materiella_anlaggningstillgangar";
      else if (1300 <= account_num && account_num < 1400) schema_field = "bs_finansiella_anlaggningstillgangar";
      else if (1400 <= account_num && account_num < 1500) schema_field = "bs_varulager";
      else if (1500 <= account_num && account_num < 1600) schema_field = "bs_kundfordringar";
      else if (1600 <= account_num && account_num < 1700) schema_field = "bs_ovriga_fordringar";
      else if (1700 <= account_num && account_num < 1800) schema_field = "bs_forutbetalda_kostnader";
      else if (1900 <= account_num && account_num < 2000) schema_field = "bs_kassa_bank";
      else if (2000 <= account_num && account_num < 2080) schema_field = "bs_bundet_eget_kapital";
      else if (2080 <= account_num && account_num < 2100) schema_field = "bs_fritt_eget_kapital";
      else if (2100 <= account_num && account_num < 2200) schema_field = "bs_obeskattade_reserver";
      else if (2300 <= account_num && account_num < 2500) schema_field = "bs_langfristiga_skulder";
      else if (2500 <= account_num && account_num < 3000) schema_field = "bs_kortfristiga_skulder";
      // Income Statement Accounts
      else if (3000 <= account_num && account_num < 4000) schema_field = "is_nettoomsattning";
      else if (4000 <= account_num && account_num < 5000) schema_field = "is_kostnad_ravaror";
      else if (5000 <= account_num && account_num < 7000) schema_field = "is_kostnad_externa";
      else if (7000 <= account_num && account_num < 7700) schema_field = "is_kostnad_personal";
      else if (7800 <= account_num && account_num < 7900) schema_field = "is_avskrivningar";
      else if (8000 <= account_num && account_num < 8300) schema_field = "is_finansiella_intakter";
      else if (8300 <= account_num && account_num < 8500) schema_field = "is_finansiella_kostnader";

      if (schema_field) {
        if (schema_field.startsWith("is_")) {
          summary[schema_field] += balance;
        } else if (schema_field.startsWith("bs_")) {
          summary[schema_field] += balance;
        }
      }
    });

    // Map to form data
    const income_statement = {};
    const balance_sheet = {};
    for (const key in summary) {
      if (key.startsWith("is_")) {
        const formKey = key.substring(3,4).toUpperCase() + key.substring(4);
        income_statement[formKey] = summary[key];
      } else if (key.startsWith("bs_")) {
        const formKey = key.substring(3,4).toUpperCase() + key.substring(4);
        balance_sheet[formKey] = summary[key];
      }
    }
    setFormData({ income_statement, balance_sheet });
    setStep("review");
  };

  const handleAccountChange = (index, newBalance) => {
    const updatedAccounts = [...detailedAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], balance: parseFloat(newBalance) || 0 };
    setDetailedAccounts(updatedAccounts);
  };

  const handleSaveAndContinue = async () => {
    const payload = {
      company_id: 1,
      start_date: reportDates.start_date,
      end_date: reportDates.end_date,
      accounts: detailedAccounts,
    };

    try {
      const response = await axios.post('/api/annual-reports/from-details', payload);
      setFinalReportId(response.data.id);
      alert("Rapporten har sparats!");
      setStep("final");
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
      case "choice":
        return <Step1_DataChoice onChoice={handleChoice} />;
      case "upload":
        return <Step2_FileUpload onUploadSuccess={handleUploadSuccess} onBack={() => setStep("choice")} />;
      case "review":
        return (
          <ReviewSieData
            accounts={detailedAccounts}
            formData={formData}
            onAccountChange={handleAccountChange}
            onBack={() => setStep("upload")}
            onNext={handleSaveAndContinue}
          />
        );
      case "final":
        return (
          <FinalStep
            reportId={finalReportId}
            onRestart={() => {
              setStep("choice");
              setDetailedAccounts([]);
              setReportDates({ start_date: '', end_date: '' });
              setFinalReportId(null);
              setFormData({ income_statement: {}, balance_sheet: {} });
            }}
          />
        );
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
