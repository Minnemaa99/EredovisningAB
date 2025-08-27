import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

// Importera de nya, separata not-komponenterna
import AccountingPrinciplesNote from './notes/AccountingPrinciplesNote';
import TangibleAssetsNote from './notes/TangibleAssetsNote';
import AverageEmployeesNote from './notes/AverageEmployeesNote';
import DefaultNote from './notes/DefaultNote';
import LongTermLiabilitiesNote from './notes/LongTermLiabilitiesNote'; // NY IMPORT

// Komponent för att rendera en enskild not med expanderbar vy
const NoteItem = ({ noteInfo, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left font-bold text-lg text-gray-700">
        <span>Not {noteInfo.ref}: {noteInfo.title}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

// Huvudkomponenten för not-steget
const Step4_Noter = ({ k2Results, onNext, onBack, notesData, onNotesDataChange }) => {
  // --- DEBUGGING: Kontrollera props i webbläsarens konsol (F12) ---
  console.log("TRACE 7 (SLUTSTEG): [Step4_Noter] Rendering. Mottagen k2Results prop:", k2Results);

  const active_notes = k2Results?.active_notes || {};
  console.log("TRACE 7.1: [Step4_Noter] Extraherade active_notes:", active_notes);
  const balance_sheet = k2Results?.balance_sheet;

  // Funktion som väljer rätt komponent baserat på notens ID
  const getNoteComponent = (noteId) => {
    if (!notesData || typeof notesData !== 'object') {
        console.error("CRITICAL: notesData är inte ett objekt!", notesData);
        return <div>Fel: Not-data kunde inte läsas.</div>;
    }
    const noteData = notesData[noteId] || {};
    const handleChange = (newData) => onNotesDataChange(noteId, newData);

    switch (noteId) {
      case 'accounting_principles':
        return <AccountingPrinciplesNote />;
      
      case 'tangible_assets':
        return <TangibleAssetsNote 
                  data={noteData} 
                  onChange={handleChange} 
                  totalValue={balance_sheet?.fixed_assets_tangible?.current || 0} 
               />;
      
      case 'average_employees':
        return <AverageEmployeesNote data={noteData} onChange={handleChange} />;
      
      // KORRIGERING: Lade till case för långfristiga skulder
      case 'long_term_liabilities':
        return <LongTermLiabilitiesNote 
                  totalValue={balance_sheet?.long_term_liabilities?.current || 0} 
               />;
      
      default:
        return <DefaultNote />;
    }
  };

  // Förbättrat "tomt" läge om inga noter finns
  if (Object.keys(active_notes).length === 0) {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl space-y-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800">Steg 4: Noter</h2>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-md">
                Inga noter att fylla i baserat på den uppladdade SIE-filen.
            </p>
            <div className="flex justify-between mt-8">
                <button onClick={onBack} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">
                    <FiArrowLeft /> Tillbaka
                </button>
                <button onClick={onNext} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                    Nästa <FiArrowRight />
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800">Steg 4: Noter</h2>
        <p className="text-center text-gray-500 mt-2">Fyll i detaljer för de noter som krävs för din årsredovisning.</p>
      </div>

      <div className="space-y-4">
        {Object.entries(active_notes).map(([noteId, noteInfo]) => (
          <NoteItem key={noteId} noteInfo={noteInfo}>
            {getNoteComponent(noteId)}
          </NoteItem>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="flex items-center gap-2 bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-300">
          <FiArrowLeft /> Tillbaka
        </button>
        <button onClick={onNext} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
          Nästa <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Step4_Noter;
