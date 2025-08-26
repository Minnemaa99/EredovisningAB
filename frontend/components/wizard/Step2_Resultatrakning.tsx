// Step2_Resultatrakning.tsx
import React, { useState } from 'react';
import { EditableRow } from './EditableRow';

// --- Huvudkomponenten ---
const Step2_Resultatrakning = ({ k2Results, onNext, onBack, onValueChange }) => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { income_statement, profit_loss } = k2Results;

  // Ny datastruktur som matchar K2-schemat från den nya kalkylatorn
  const reportData = [
      { type: 'header', label: 'Rörelsens intäkter' },
      { type: 'sub', label: 'Nettoomsättning', values: income_statement.net_sales, accountRange: { start: 3000, end: 3799 } },
      { type: 'sub', label: 'Övriga rörelseintäkter', values: income_statement.other_operating_income, accountRange: { start: 3800, end: 3999 } },
      { type: 'total', label: 'Summa rörelseintäkter', values: income_statement.total_operating_income },
      
      { type: 'header', label: 'Rörelsekostnader' },
      { type: 'sub', label: 'Råvaror och förnödenheter', values: income_statement.raw_materials, accountRange: { start: 4000, end: 4999 } },
      { type: 'sub', label: 'Övriga externa kostnader', values: income_statement.other_external_costs, accountRange: { start: 5000, end: 6999 } },
      { type: 'sub', label: 'Personalkostnader', values: income_statement.personnel_costs, accountRange: { start: 7000, end: 7699 } },
      { type: 'sub', label: 'Av- och nedskrivningar', values: income_statement.depreciation, accountRange: { start: 7700, end: 7899 } },
      { type: 'sub', label: 'Övriga rörelsekostnader', values: income_statement.other_operating_expenses, accountRange: { start: 7900, end: 7999 } },
      { type: 'total', label: 'Summa rörelsekostnader', values: income_statement.total_operating_expenses },

      { type: 'grand-total', label: 'Rörelseresultat', values: income_statement.operating_profit },

      { type: 'header', label: 'Finansiella poster' },
      { type: 'sub', label: 'Övriga ränteintäkter och liknande', values: income_statement.financial_income, accountRange: { start: 8200, end: 8299 } },
      { type: 'sub', label: 'Räntekostnader och liknande', values: income_statement.financial_costs, accountRange: { start: 8300, end: 8499 } },
      
      { type: 'grand-total', label: 'Resultat efter finansiella poster', values: income_statement.profit_after_financial_items },

      { type: 'sub', label: 'Bokslutsdispositioner', values: income_statement.appropriations, accountRange: { start: 8800, end: 8899 } },
      { type: 'grand-total', label: 'Resultat före skatt', values: income_statement.profit_before_tax },

      { type: 'sub', label: 'Skatt på årets resultat', values: income_statement.tax, accountRange: { start: 8900, end: 8999 } },
      { type: 'grand-total', label: 'Årets resultat', values: profit_loss },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Resultaträkning</h2>
      <p className="text-center text-gray-500 mb-6">Enligt K2-regelverket. Klicka på en siffra för att redigera.</p>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/4">Beskrivning</th>
              <th className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Not</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktuellt år (SEK)</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Föregående år (SEK)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <EditableRow 
                key={index}
                label={row.label}
                values={row.values}
                type={row.type}
                show={true} // Alltid visa alla rader i den nya strukturen
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