import React, { useState } from 'react';
import { FiFileText, FiCheckCircle } from 'react-icons/fi';

import Step4_Noter from './Step4_Noter';
import Step5_Forvaltningsberattelse from './Step5_Forvaltningsberattelse';

interface Props {
  k2Results: any;
  onNext: () => void;
  onBack: () => void;
  onForvaltningsberattelseSave: (text: string) => void;
  notesData: any;
  onNotesDataChange: (noteId: string, data: any) => void;
  dividend: number;
  onDividendChange: (amount: number) => void;
  flerarsOversikt: any;
  setFlerarsOversikt: (data: any) => void;
}

const Step4_Arsredovisning: React.FC<Props> = ({
  k2Results,
  onNext,
  onBack,
  onForvaltningsberattelseSave,
  notesData,
  onNotesDataChange,
  dividend,
  onDividendChange,
  flerarsOversikt,
  setFlerarsOversikt
}) => {
  const [subStep, setSubStep] = useState<'noter' | 'forvaltningsberattelse'>('noter');

  const handleNotesNext = () => setSubStep('forvaltningsberattelse');
  const handleForvaltningsberattelseBack = () => setSubStep('noter');
  const handleSaveAndGoToNextMainStep = (text: string) => {
    onForvaltningsberattelseSave(text);
    // onNext();
  };

  const menuItems = [
    { id: 'noter', label: 'Noter' },
    { id: 'forvaltningsberattelse', label: 'Förvaltningsberättelse' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto bg-white rounded-2xl shadow-xl">
      <nav className="flex gap-4 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSubStep(item.id as any)}
            className={`px-6 py-3 rounded-t-lg font-semibold transition-all duration-200 border-b-2 ${
              subStep === item.id
                ? 'border-blue-600 text-blue-700 bg-blue-50'
                : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main className="w-full">
        {subStep === 'noter' && (
          <Step4_Noter
            k2Results={k2Results}
            onNext={handleNotesNext}
            onBack={onBack}
            notesData={notesData}
            onNotesDataChange={onNotesDataChange}
          />
        )}
        {subStep === 'forvaltningsberattelse' && (
          <Step5_Forvaltningsberattelse
            k2Results={k2Results}
            onSave={(text, flerarsData) => onForvaltningsberattelseSave(text, flerarsData)}
            onBack={handleForvaltningsberattelseBack}
            dividend={dividend}
            onDividendChange={onDividendChange}
            flerarsOversikt={flerarsOversikt}
            setFlerarsOversikt={setFlerarsOversikt}
          />
        )}
      </main>
    </div>
  );
};

export default Step4_Arsredovisning;