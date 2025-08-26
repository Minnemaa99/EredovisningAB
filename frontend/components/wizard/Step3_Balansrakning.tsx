import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { EditableRow } from './EditableRow'; // Importera den nya komponenten

// --- Typer och hjälpfunktioner ---
const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

// --- Huvudkomponenten ---
const Step3_Balansrakning = ({ k2Results, onNext, onBack, onValueChange }) => { // Lägg till onValueChange
  const [showAllPosts, setShowAllPosts] = useState(false);
  
  // Plocka ut den färdigberäknade datan från props
  const { balance_sheet, total_assets, total_equity, total_equity_and_liabilities, balance_check } = k2Results;

  // Definiera raderna statiskt med accountRange för redigering
  const reportData = {
      rows: [
        { label: 'TILLGÅNGAR', type: 'header', show: 'always' },
        { label: 'Anläggningstillgångar', type: 'main', values: balance_sheet.total_fixed_assets, show: 'always' },
        { label: 'Materiella anläggningstillgångar', type: 'sub', values: balance_sheet.fixed_assets_tangible, show: 'expanded', accountRange: { start: 1100, end: 1299 } },
        
        { label: 'Omsättningstillgångar', type: 'main', values: balance_sheet.total_current_assets, show: 'always' },
        { label: 'Varulager m.m.', type: 'sub', values: balance_sheet.inventory, show: 'expanded', accountRange: { start: 1400, end: 1499 } },
        { label: 'Kortfristiga fordringar', type: 'sub', values: balance_sheet.current_receivables, show: 'expanded', accountRange: { start: 1500, end: 1799 } },
        { label: 'Kassa och bank', type: 'sub', values: balance_sheet.cash_and_bank, show: 'expanded', accountRange: { start: 1900, end: 1999 } },
        
        { label: 'SUMMA TILLGÅNGAR', type: 'grand-total', values: total_assets, show: 'always' },
        
        { label: 'EGET KAPITAL OCH SKULDER', type: 'header', show: 'always' },
        { label: 'Eget kapital', type: 'main', values: total_equity, show: 'always' },
        { label: 'Bundet eget kapital', type: 'sub', values: balance_sheet.restricted_equity, show: 'expanded', accountRange: { start: 2000, end: 2089 } },
        
        { label: 'Obeskattade reserver', type: 'main', values: balance_sheet.untaxed_reserves, show: 'always', accountRange: { start: 2100, end: 2199 } },
        
        { label: 'Långfristiga skulder', type: 'main', values: balance_sheet.long_term_liabilities, show: 'always', accountRange: { start: 2300, end: 2399 } },
        
        { label: 'Kortfristiga skulder', type: 'main', values: balance_sheet.current_liabilities, show: 'always', accountRange: { start: 2400, end: 2999 } },
        
        { label: 'SUMMA EGET KAPITAL OCH SKULDER', type: 'grand-total', values: total_equity_and_liabilities, show: 'always' },
      ],
      balanceCheck: balance_check,
    };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Balansräkning</h2>
      <p className="text-center text-gray-500 mb-6">Klicka på en siffra i kolumnen "Aktuellt år" för att redigera.</p>
      
      <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-gray-50">
        <div className="flex items-center">
          <label htmlFor="showAllPostsToggle" className="mr-3 text-sm font-medium text-gray-700">Visa alla poster</label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input 
              type="checkbox" 
              name="showAllPostsToggle" 
              id="showAllPostsToggle" 
              checked={showAllPosts}
              onChange={() => setShowAllPosts(!showAllPosts)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:bg-blue-600"
            />
            <label htmlFor="showAllPostsToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivning</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SEK</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SEK</th>
            </tr>
          </thead>
          <tbody>
            {reportData.rows.map((row, index) => (
              <EditableRow 
                key={index}
                label={row.label}
                values={row.values}
                type={row.type}
                show={row.show === 'always' || showAllPosts}
                accountRange={row.accountRange}
                onValueChange={onValueChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {reportData.balanceCheck.current !== 0 && (
         <div className="mt-6 flex items-center bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-r-lg" role="alert">
          <FiAlertTriangle className="h-6 w-6 mr-3" />
          <div>
            <p className="font-bold">Balanskontroll misslyckades!</p>
            <p className="text-sm">Tillgångar och skulder balanserar inte för aktuellt år. Differens: {formatNumber(reportData.balanceCheck.current)} kr.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
          Tillbaka
        </button>
        <button onClick={onNext} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          Spara & Gå vidare
        </button>
      </div>
    </div>
  );
};

export default Step3_Balansrakning;
