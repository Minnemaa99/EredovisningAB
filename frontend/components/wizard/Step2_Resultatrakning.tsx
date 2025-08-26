// Step2_Resultatrakning.tsx
import React, { useState } from 'react';
import { EditableRow } from './EditableRow'; // Importera den nya komponenten

// --- Typer och hjälpfunktioner ---
const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

const ReportRow = ({ label, values, type, show }) => {
    if (!show) return null;

    const getRowStyle = (type: string) => {
        switch (type) {
          case 'main': return 'font-semibold text-gray-700';
          case 'sub': return 'pl-8 text-gray-600';
          case 'total': return 'font-bold bg-gray-50';
          case 'grand-total': return 'font-extrabold text-lg border-t-2 border-black';
          default: return '';
        }
    };

    return (
        <tr className={`${getRowStyle(type)} border-b border-gray-100 last:border-b-0`}>
            <td className="px-2 py-3 whitespace-nowrap">{label}</td>
            <td className="px-2 py-3 whitespace-nowrap text-right font-mono">{values ? formatNumber(values.current) : ''}</td>
            <td className="px-2 py-3 whitespace-nowrap text-right font-mono text-gray-500">{values ? formatNumber(values.previous) : ''}</td>
        </tr>
    );
};

// --- Huvudkomponenten ---
const Step2_Resultatrakning = ({ k2Results, onNext, onBack, onValueChange }) => { // Lägg till onValueChange
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { income_statement, profit_loss } = k2Results;

  // Lägg till accountRange för varje rad som ska vara redigerbar
  const reportData = [
      { label: 'Rörelsens intäkter', type: 'main', values: income_statement.net_sales, show: 'always', accountRange: { start: 3000, end: 3799 } },
      { label: 'Nettoomsättning', type: 'sub', values: income_statement.net_sales, show: 'expanded', accountRange: { start: 3000, end: 3799 } },
      
      { label: 'Rörelsekostnader', type: 'main', values: income_statement.total_operating_expenses, show: 'always' },
      { label: 'Handelsvaror', type: 'sub', values: income_statement.cost_of_goods, show: 'expanded', accountRange: { start: 4000, end: 4999 } },
      { label: 'Övriga externa kostnader', type: 'sub', values: income_statement.other_external_costs, show: 'expanded', accountRange: { start: 5000, end: 6999 } },
      { label: 'Personalkostnader', type: 'sub', values: income_statement.personnel_costs, show: 'expanded', accountRange: { start: 7000, end: 7699 } },
      { label: 'Av- och nedskrivningar', type: 'sub', values: income_statement.depreciation, show: 'expanded', accountRange: { start: 7700, end: 7899 } },
      
      { label: 'Rörelseresultat', type: 'total', values: income_statement.operating_profit, show: 'always' },
      
      { label: 'Finansiella poster', type: 'main', values: income_statement.financial_items, show: 'always' },
      
      { label: 'Resultat efter finansiella poster', type: 'total', values: income_statement.profit_after_financial_items, show: 'always' },
      
      { label: 'Skatt på årets resultat', type: 'main', values: income_statement.tax, show: 'always', accountRange: { start: 8900, end: 8999 } },

      { label: 'Årets resultat', type: 'grand-total', values: profit_loss, show: 'always' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Resultaträkning</h2>
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
            {reportData.map((row, index) => (
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

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100">
          Tillbaka
        </button>
        <button onClick={onNext} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md">
          Spara & Gå vidare
        </button>
      </div>
    </div>
  );
};

export default Step2_Resultatrakning;