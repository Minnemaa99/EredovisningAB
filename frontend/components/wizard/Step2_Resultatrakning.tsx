// Step2_Resultatrakning.tsx
import React, { useState } from 'react';
import EditableRow from './EditableRow';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const formatDate = (dStr?: string) => {
  if (!dStr) return '';
  const d = new Date(dStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const prevPeriod = (start?: string, end?: string) => {
  if (!start || !end) return { start: '', end: '' };
  const s = new Date(start); const e = new Date(end);
  s.setFullYear(s.getFullYear() - 1);
  e.setFullYear(e.getFullYear() - 1);
  return { start: formatDate(s.toISOString()), end: formatDate(e.toISOString()) };
};

const Step2_Resultatrakning = ({ k2Results, reportDates, onNext, onBack, onValueChange }) => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const { income_statement, profit_loss } = k2Results || {};

  // debug: flytta hit efter destructuring
  // eslint-disable-next-line no-console
  console.log('DEBUG Step2 tax:', income_statement?.tax);

  const currentStart = formatDate(reportDates?.start_date);
  const currentEnd = formatDate(reportDates?.end_date);
  const prev = prevPeriod(reportDates?.start_date, reportDates?.end_date);

  const reportData = [
    { type: 'total', label: 'Rörelseintäkter, lagerförändringar m.m.', values: income_statement?.total_operating_income || { current: 0, previous: 0 }, highlight: true },
    { type: 'sub', label: 'Nettoomsättning', values: income_statement?.net_sales || { current: 0, previous: 0 }, accountRange: { start: 3000, end: 3799 } },
    { type: 'sub', label: (<><span>Förändring av lager av produkter i arbete, </span><wbr/> <span>färdiga varor och pågående arbete för annans räkning</span></>), values: income_statement?.inventory_changes || { current: 0, previous: 0 }, accountRange: { start: 4900, end: 4999 } },
    { type: 'sub', label: 'Aktiverat arbete för egen räkning', values: income_statement?.own_work_capitalized || { current: 0, previous: 0 }, accountRange: { start: 3800, end: 3899 } },
    { type: 'sub', label: 'Övriga rörelseintäkter', values: income_statement?.other_operating_income || { current: 0, previous: 0 }, accountRange: { start: 3900, end: 3999 } },
    { type: 'total', label: 'Summa rörelseintäkter', values: income_statement?.total_operating_income, accountRange: { start: 3000, end: 3999 } },

    // Rörelsekostnader (gör header redigerbar med dummy-intervall)
    { type: 'total', label: 'Rörelsekostnader', values: income_statement?.total_operating_expenses, displayNegative: true, highlight: true },
    { type: 'sub', label: 'Handelsvaror', values: income_statement?.trade_goods || { current: 0, previous: 0 }, accountRange: { start: 4000, end: 4599 }, displayNegative: true },
    { type: 'sub', label: 'Råvaror och förnödenheter', values: income_statement?.raw_materials || { current: 0, previous: 0 }, accountRange: { start: 4600, end: 4999 }, displayNegative: true },
    { type: 'sub', label: 'Övriga externa kostnader', values: income_statement?.other_external_costs || { current: 0, previous: 0 }, accountRange: { start: 5000, end: 6999 }, displayNegative: true },
    { type: 'sub', label: 'Personalkostnader', values: income_statement?.personnel_costs || { current: 0, previous: 0 }, accountRange: { start: 7000, end: 7699 }, displayNegative: true },
    { type: 'sub', label: 'Av- och nedskrivningar av materiella och immateriella anläggningstillgångar', values: income_statement?.depreciation || { current: 0, previous: 0 }, accountRange: { start: 7700, end: 7899 }, displayNegative: true },
    { type: 'sub', label: 'Nedskrivningar av omsättningstillgångar utöver normala nedskrivningar', values: income_statement?.impairments_inventory || { current: 0, previous: 0 }, displayNegative: true, accountRange: { start: 7900, end: 7999 } },
    { type: 'sub', label: 'Övriga rörelsekostnader', values: income_statement?.other_operating_expenses || { current: 0, previous: 0 }, accountRange: { start: 7900, end: 7999 }, displayNegative: true },
   

    { type: 'grand-total', label: 'Rörelseresultat', values: income_statement?.operating_profit, highlight: true },

    // Finansiella poster
    { 
      type: 'total', 
      label: 'Finansiella poster', 
      values: income_statement?.financial_total || {
        current: (income_statement?.financial_income?.current || 0) - (income_statement?.financial_costs?.current || 0),
        previous: (income_statement?.financial_income?.previous || 0) - (income_statement?.financial_costs?.previous || 0)
      }, 
      highlight: true
    },
    { type: 'sub', label: 'Resultat från andelar i koncernföretag', values: income_statement?.profit_from_group_shares || { current: 0, previous: 0 }, accountRange: { start: 8010, end: 8099 } },
    { type: 'sub', label: 'Resultat från andelar i intresseföretag och gemensamt styrda företag', values: income_statement?.profit_from_associated_shares || { current: 0, previous: 0 }, accountRange: { start: 8100, end: 8199 } },
    { type: 'sub', label: 'Resultat från övriga företag som det finns ett ägarintresse i', values: income_statement?.profit_from_other_companies || { current: 0, previous: 0 }, accountRange: { start: 8200, end: 8299 } },
    { type: 'sub', label: 'Resultat från övriga finansiella anläggningstillgångar', values: income_statement?.profit_from_financial_assets || { current: 0, previous: 0 }, accountRange: { start: 8300, end: 8399 } },
    { type: 'sub', label: 'Övriga ränteintäkter och liknande resultatposter', values: income_statement?.financial_income || { current: 0, previous: 0 }, accountRange: { start: 8000, end: 8399 } },
    { type: 'sub', label: 'Nedskrivningar av finansiella anläggningstillgångar och kortfristiga placeringar', values: income_statement?.impairments_financial || { current: 0, previous: 0 }, accountRange: { start: 8800, end: 8899 } },
    { type: 'sub', label: 'Räntekostnader och liknande resultatposter', values: income_statement?.financial_costs || { current: 0, previous: 0 }, accountRange: { start: 8400, end: 8799 }, displayNegative: true },

    { type: 'grand-total', label: 'Resultat efter finansiella poster', values: income_statement?.profit_after_financial_items, highlight: true },

    // Uppdaterad Bokslutsdispositioner-sektion med nya poster enligt din ordning
    { type: 'header', label: 'Bokslutsdispositioner', highlight: true, values: income_statement?.appropriations || { current: 0, previous: 0 } },
    { type: 'sub', label: 'Erhållna koncernbidrag', values: income_statement?.received_group_contributions || { current: 0, previous: 0 }, accountRange: { start: 8810, end: 8819 } },
    { type: 'sub', label: 'Lämnade koncernbidrag', values: income_statement?.given_group_contributions || { current: 0, previous: 0 }, accountRange: { start: 8820, end: 8829 } },
    { type: 'sub', label: 'Förändring av periodiseringsfonder', values: income_statement?.appropriations_periodization_funds || { current: 0, previous: 0 }, accountRange: { start: 8800, end: 8899 } },
    { type: 'sub', label: 'Förändring av överavskrivningar', values: income_statement?.change_over_depreciations || { current: 0, previous: 0 }, accountRange: { start: 8830, end: 8839 } },
    { type: 'sub', label: 'Övriga bokslutsdispositioner', values: income_statement?.appropriations || { current: 0, previous: 0 }, accountRange: { start: 8800, end: 8899 } },
    { type: 'grand-total', label: 'Resultat före skatt', values: income_statement?.profit_before_tax, highlight: true },

    // Skatt-sektion med debug och ny post
    { type: 'sub', label: 'Skatt på årets resultat', values: income_statement?.tax || { current: 0, previous: 0 }, accountRange: { start: 8910, end: 8919 }, displayNegative: true },
    { type: 'sub', label: 'Övriga skatter', values: income_statement?.other_taxes || { current: 0, previous: 0 }, accountRange: { start: 8920, end: 8929 } },
    { type: 'grand-total', label: 'Årets resultat', values: profit_loss || { current: 0, previous: 0 }, highlight: true },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Resultaträkning</h2>
          <p className="text-sm text-gray-500 mt-1">Enligt K2-regelverket. Klicka i ett fält för att ändra.</p>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="pb-4 pt-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">BESKRIVNING</th>
                <th className="pb-4 pt-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">NOT</th>
                <th className="pb-0 pt-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="text-[11px] text-gray-400">{currentStart}</div>
                  <div className="text-[11px] text-gray-400">- {currentEnd}</div>
                  <div className="mt-1 text-[12px]">AKTUELLT ÅR</div>
                </th>
                <th className="pb-0 pt-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="text-[11px] text-gray-400">{prev.start}</div>
                  <div className="text-[11px] text-gray-400">- {prev.end}</div>
                  <div className="mt-1 text-[12px]">FÖREGÅENDE ÅR</div>
                </th>
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
                  displayNegative={row.displayNegative}
                  highlight={row.highlight}
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