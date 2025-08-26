// Step2_Resultatrakning.tsx
import React, { useState } from 'react';
import { EditableRow } from './EditableRow';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

// --- Huvudkomponenten ---
const Step2_Resultatrakning = ({ k2Results, onNext, onBack, onValueChange }) => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { income_statement, profit_loss } = k2Results;

  // NY, KOMPLETT STRUKTUR: Innehåller nu alla rader från K2-schemat, inklusive tomma poster.
  const reportData = [
      { type: 'header', label: 'Rörelsens intäkter' },
      { type: 'sub', label: 'Nettoomsättning', values: income_statement.net_sales, accountRange: { start: 3000, end: 3799 } },
      { type: 'sub', label: 'Förändring av lager', values: income_statement.inventory_changes || { current: 0, previous: 0 }, accountRange: { start: 4900, end: 4999 } },
      { type: 'sub', label: 'Aktiverat arbete för egen räkning', values: income_statement.own_work_capitalized || { current: 0, previous: 0 }, accountRange: { start: 3800, end: 3899 } },
      { type: 'sub', label: 'Övriga rörelseintäkter', values: income_statement.other_operating_income, accountRange: { start: 3900, end: 3999 } },
      { type: 'total', label: 'Summa rörelseintäkter', values: income_statement.total_operating_income },
      
      { type: 'header', label: 'Rörelsekostnader' },
      { type: 'sub', label: 'Handelsvaror', values: income_statement.trade_goods || { current: 0, previous: 0 }, accountRange: { start: 4000, end: 4599 } },
      { type: 'sub', label: 'Råvaror och förnödenheter', values: income_statement.raw_materials, accountRange: { start: 4600, end: 4999 } },
      { type: 'sub', label: 'Övriga externa kostnader', values: income_statement.other_external_costs, accountRange: { start: 5000, end: 6999 } },
      { type: 'sub', label: 'Personalkostnader', values: income_statement.personnel_costs, accountRange: { start: 7000, end: 7699 } },
      { type: 'sub', label: 'Av- och nedskrivningar', values: income_statement.depreciation, accountRange: { start: 7700, end: 7899 } },
      { type: 'sub', label: 'Övriga rörelsekostnader', values: income_statement.other_operating_expenses, accountRange: { start: 7900, end: 7999 } },
      { type: 'total', label: 'Summa rörelsekostnader', values: income_statement.total_operating_expenses },

      { type: 'grand-total', label: 'Rörelseresultat', values: income_statement.operating_profit },

      { type: 'header', label: 'Finansiella poster' },
      { type: 'sub', label: 'Resultat från andelar i koncernföretag', values: income_statement.profit_from_group_shares || { current: 0, previous: 0 } },
      { type: 'sub', label: 'Resultat från andelar i intresseföretag', values: income_statement.profit_from_associated_shares || { current: 0, previous: 0 } },
      { type: 'sub', label: 'Övriga ränteintäkter och liknande', values: income_statement.financial_income, accountRange: { start: 8000, end: 8399 } },
      { type: 'sub', label: 'Räntekostnader och liknande', values: income_statement.financial_costs, accountRange: { start: 8400, end: 8799 } },
      
      { type: 'grand-total', label: 'Resultat efter finansiella poster', values: income_statement.profit_after_financial_items },

      { type: 'header', label: 'Bokslutsdispositioner' },
      { type: 'sub', label: 'Förändring av periodiseringsfonder', values: income_statement.appropriations_periodization_funds || { current: 0, previous: 0 } },
      { type: 'sub', label: 'Övriga bokslutsdispositioner', values: income_statement.appropriations, accountRange: { start: 8800, end: 8899 } },
      { type: 'grand-total', label: 'Resultat före skatt', values: income_statement.profit_before_tax },

      { type: 'sub', label: 'Skatt på årets resultat', values: income_statement.tax, accountRange: { start: 8910, end: 8919 } },
      { type: 'grand-total', label: 'Årets resultat', values: profit_loss },
  ];

  return (
    // NY DESIGN: Hela strukturen är omgjord för en modernare och snyggare känsla.
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight text-center">Resultaträkning</h2>
          <p className="text-center text-gray-500 mt-2">Enligt K2-regelverket. Klicka på en siffra för att redigera.</p>
        </div>
        
        <div className="overflow-x-auto p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="pb-4 pt-2 text-left text-sm font-bold text-gray-500 uppercase tracking-wider w-2/4">Beskrivning</th>
                <th className="pb-4 pt-2 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">Not</th>
                <th className="pb-4 pt-2 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">Aktuellt år (SEK)</th>
                <th className="pb-4 pt-2 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">Föregående år (SEK)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <EditableRow 
                  key={index}
                  label={row.label}
                  values={row.values}
                  type={row.type}
                  show={true}
                  accountRange={row.accountRange}
                  onValueChange={onValueChange}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50/50 flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
          >
            <FiArrowLeft />
            Tillbaka
          </button>
          <button 
            onClick={onNext} 
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Spara & Gå vidare
            <FiSave />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step2_Resultatrakning;