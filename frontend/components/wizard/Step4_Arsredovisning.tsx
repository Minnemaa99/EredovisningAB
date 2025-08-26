import React, { useState } from 'react';
import { FiFileText, FiCheckCircle } from 'react-icons/fi';

// Importera de befintliga stegen som nu blir del-steg
import Step4_Noter from './Step4_Noter';
import Step5_Forvaltningsberattelse from './Step5_Forvaltningsberattelse';

interface Props {
  k2Results: any;
  onNext: () => void;
  onBack: () => void;
  onForvaltningsberattelseSave: (text: string) => void;
}

const Step4_Arsredovisning: React.FC<Props> = ({ k2Results, onNext, onBack, onForvaltningsberattelseSave }) => {
  const [subStep, setSubStep] = useState<'noter' | 'forvaltningsberattelse'>('noter');

  const handleNotesNext = () => {
    setSubStep('forvaltningsberattelse');
  };

  const handleForvaltningsberattelseBack = () => {
    setSubStep('noter');
  };

  // När man är klar med förvaltningsberättelsen och klickar "Nästa",
  // sparas datan och vi går vidare till nästa huvudsteg i wizarden.
  const handleSaveAndGoToNextMainStep = (text: string) => {
    onForvaltningsberattelseSave(text);
    // onNext() anropas inte här, det sköts av Wizard.tsx
  };

  const menuItems = [
    { id: 'noter', label: 'Noter' },
    { id: 'forvaltningsberattelse', label: 'Förvaltningsberättelse' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-2xl shadow-xl flex gap-8">
      {/* Sidomeny */}
      <aside className="w-1/4 border-r pr-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Årsredovisning</h3>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.id} className="mb-2">
                <button
                  onClick={() => setSubStep(item.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                    subStep === item.id
                      ? 'bg-blue-600 text-white font-bold shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subStep === item.id ? <FiCheckCircle /> : <FiFileText />}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Huvudinnehåll */}
      <main className="w-3/4">
        {subStep === 'noter' && (
          <Step4_Noter
            k2Results={k2Results}
            onNext={handleNotesNext} // Gå till nästa del-steg
            onBack={onBack} // Gå till föregående huvud-steg
          />
        )}
        {subStep === 'forvaltningsberattelse' && (
          <Step5_Forvaltningsberattelse
            k2Results={k2Results}
            onSave={handleSaveAndGoToNextMainStep} // Spara och gå till nästa huvud-steg
            onBack={handleForvaltningsberattelseBack} // Gå till föregående del-steg
          />
        )}
      </main>
    </div>
  );
};

export default Step4_Arsredovisning;