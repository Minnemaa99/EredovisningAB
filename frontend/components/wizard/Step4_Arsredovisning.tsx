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
}

const Step4_Arsredovisning: React.FC<Props> = ({
  k2Results,
  onNext,
  onBack,
  onForvaltningsberattelseSave,
  notesData,
  onNotesDataChange,
  dividend,
  onDividendChange
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
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-2xl shadow-xl flex gap-8">
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

      <main className="w-3/4">
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
            onSave={handleSaveAndGoToNextMainStep}
            onBack={handleForvaltningsberattelseBack}
            dividend={dividend}
            onDividendChange={onDividendChange}
          />
        )}
      </main>
    </div>
  );
};

export default Step4_Arsredovisning;