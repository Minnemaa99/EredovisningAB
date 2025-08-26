import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

// --- Typer och hjälpfunktioner ---
const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

const ReportRow = ({ label, values, type, show }) => {
    if (!show) return null;

    const getRowStyle = (type: string) => {
        switch (type) {
          case 'header': return 'font-bold text-lg pt-6 text-gray-800';
          case 'main': return 'font-semibold text-gray-700';
          case 'sub': return 'pl-8 text-gray-600';
          case 'grand-total': return 'font-extrabold text-lg border-t-2 border-b-4 border-black bg-gray-50';
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
const Step3_Balansrakning = ({ k2Results, onNext, onBack }) => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  
  // Plocka ut den färdigberäknade datan från props
  const { balance_sheet, total_assets, total_equity, total_equity_and_liabilities, balance_check } = k2Results;

  // Definiera raderna statiskt med datan från k2Results
  const reportData = {
      rows: [
        { label: 'TILLGÅNGAR', type: 'header', show: 'always' },
        { label: 'Anläggningstillgångar', type: 'main', values: balance_sheet.total_fixed_assets, show: 'always' },
        { label: 'Materiella anläggningstillgångar', type: 'sub', values: balance_sheet.fixed_assets_tangible, show: 'expanded' },
        
        { label: 'Omsättningstillgångar', type: 'main', values: balance_sheet.total_current_assets, show: 'always' },
        { label: 'Varulager m.m.', type: 'sub', values: balance_sheet.inventory, show: 'expanded' },
        { label: 'Kortfristiga fordringar', type: 'sub', values: balance_sheet.current_receivables, show: 'expanded' },
        { label: 'Kassa och bank', type: 'sub', values: balance_sheet.cash_and_bank, show: 'expanded' },
        
        { label: 'SUMMA TILLGÅNGAR', type: 'grand-total', values: total_assets, show: 'always' },
        
        { label: 'EGET KAPITAL OCH SKULDER', type: 'header', show: 'always' },
        { label: 'Eget kapital', type: 'main', values: total_equity, show: 'always' },
        { label: 'Bundet eget kapital', type: 'sub', values: balance_sheet.restricted_equity, show: 'expanded' },
        
        { label: 'Obeskattade reserver', type: 'main', values: balance_sheet.untaxed_reserves, show: 'always' },
        
        { label: 'Långfristiga skulder', type: 'main', values: balance_sheet.long_term_liabilities, show: 'always' },
        
        { label: 'Kortfristiga skulder', type: 'main', values: balance_sheet.current_liabilities, show: 'always' },
        
        { label: 'SUMMA EGET KAPITAL OCH SKULDER', type: 'grand-total', values: total_equity_and_liabilities, show: 'always' },
      ],
      balanceCheck: balance_check,
    };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Balansräkning</h2>
      <p className="text-center text-gray-500 mb-6">En ögonblicksbild av företagets finansiella ställning.</p>
      
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
        <div className="text-right text-xs text-gray-500 font-mono">
            <div>Aktuellt år</div>
            <div>Föregående år</div>
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
              <ReportRow 
                key={index}
                label={row.label}
                values={row.values}
                type={row.type}
                show={row.show === 'always' || showAllPosts}
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
