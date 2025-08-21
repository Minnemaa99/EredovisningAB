import React, { useState } from 'react';
import Resultatrakning from './Resultatrakning';
import Balansrakning from './Balansrakning';
import Noter from './Noter';
import Forvaltningsberattelse from './Forvaltningsberattelse';
import Underskrifter from './Underskrifter';
// Final steps would be preview and payment, which can be added here

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [reportData, setReportData] = useState({
    // This state would be much more detailed, matching the user's spec
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Resultatrakning nextStep={nextStep} prevStep={() => {}} values={reportData} handleChange={handleChange} />;
      case 2:
        return <Balansrakning nextStep={nextStep} prevStep={prevStep} values={reportData} handleChange={handleChange} />;
      case 3:
        return <Forvaltningsberattelse nextStep={nextStep} prevStep={prevStep} />;
      case 4:
        return <Noter nextStep={nextStep} prevStep={prevStep} />;
      case 5:
        return <Underskrifter nextStep={nextStep} prevStep={prevStep} />;
      default:
        return <div>Granska & Betala (Sista steget)</div>;
    }
  };

  const stepNames = ["Resultaträkning", "Balansräkning", "Förvaltningsberättelse", "Noter", "Underskrifter"];

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2">Skapa Årsredovisning</h1>
      <p className="text-gray-600 mb-6">Steg {step} av {stepNames.length}: <strong>{stepNames[step - 1]}</strong></p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(step / stepNames.length) * 100}%` }}></div>
      </div>
      {renderStep()}
    </div>
  );
}
