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
  notesData: any;
  onNotesDataChange: (noteId: string, data: any) => void;
  // NYTT: Ta emot props för utdelning
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
  // NYTT: Hämta ut de nya propsen
  dividend,
  onDividendChange
}) => {
  const [subStep, setSubStep] = useState<'noter' | 'forvaltningsberattelse'>('noter');

  // TRACEBACK STEG 2: Logga propen som tas emot från Wizard.tsx
  console.log("--- TRACEBACK 2: [Step4] Mottagen k2Results prop:", k2Results);

  // Funktion för att gå från Noter -> Förvaltningsberättelse
  const handleNotesNext = () => {
    setSubStep('forvaltningsberattelse');
  };

  // Funktion för att gå från Förvaltningsberättelse -> Noter
  const handleForvaltningsberattelseBack = () => {
    setSubStep('noter');
  };

  // När man är klar med förvaltningsberättelsen, spara texten och gå till nästa huvudsteg.
  const handleSaveAndGoToNextMainStep = (text: string) => {
    onForvaltningsberattelseSave(text);
    // onNext(); // Gå vidare till nästa huvudsteg (Företrädare)
  };

  const menuItems = [
    { id: 'noter', label: 'Noter' },
    { id: 'forvaltningsberattelse', label: 'Förvaltningsberättelse' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white rounded-2xl shadow-xl flex gap-8">
      {/* Sidomeny för del-steg */}
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

      {/* Huvudinnehåll som renderar aktivt del-steg */}
      <main className="w-3/4">
        {subStep === 'noter' && (
          <Step4_Noter
            // SLUTGILTIG LÖSNING: Skicka en djup klon av objektet.
            // Detta förhindrar att denna komponent oavsiktligt ändrar datan för andra komponenter.
            k2Results={JSON.parse(JSON.stringify(k2Results))}
            onNext={handleNotesNext}                 // Gå till nästa del-steg
            onBack={onBack}                         // Gå till föregående huvud-steg
            notesData={notesData}
            onNotesDataChange={onNotesDataChange}
          />
        )}
        {subStep === 'forvaltningsberattelse' && (
          <Step5_Forvaltningsberattelse
            // SLUTGILTIG LÖSNING: Skicka en djup klon av objektet.
            // Detta garanterar att denna komponent får en ren, oförändrad kopia av datan.
            k2Results={JSON.parse(JSON.stringify(k2Results))}
            onSave={handleSaveAndGoToNextMainStep}  // Spara och gå till nästa huvud-steg
            onBack={handleForvaltningsberattelseBack} // Gå till föregående del-steg
            // NYTT: Skicka vidare propsen till rätt komponent
            dividend={dividend}
            onDividendChange={onDividendChange}
          />
        )}
      </main>
    </div>
  );
};

export default Step4_Arsredovisning;