import React, { useState } from 'react';
import { FiAlertTriangle, FiArrowLeft, FiSave, FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import { EditableRow } from './EditableRow';

const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

const Step3_Balansrakning = ({ k2Results, onNext, onBack, onValueChange }) => {
  const { balance_sheet, total_assets, total_equity_and_liabilities, balance_check } = k2Results;
  const [showAll, setShowAll] = useState(false);

  // EXAKT STRUKTUR: Matchar nu bilden 1:1, med ALLA rader.
  const reportData = {
      rows: [
        { type: 'header', label: 'TILLGÅNGAR' },
        { type: 'main', label: 'Anläggningstillgångar' },
        { type: 'sub-main', label: 'Materiella anläggningstillgångar', values: balance_sheet.fixed_assets_tangible },
        { type: 'sub', label: 'Inventarier, verktyg och installationer', values: balance_sheet.fixed_assets_tangible, accountRange: { start: 1200, end: 1229 } },
        { type: 'sub-main', label: 'Finansiella anläggningstillgångar', values: balance_sheet.fixed_assets_financial || { current: 0, previous: 0 } },
        { type: 'sub', label: 'Lån till delägare eller närstående', values: balance_sheet.loans_to_shareholders || { current: 0, previous: 0 }, accountRange: { start: 1380, end: 1389 } },
        { type: 'sub', label: 'Andra långfristiga fordringar', values: balance_sheet.other_long_term_receivables || { current: 0, previous: 0 }, accountRange: { start: 1300, end: 1379 } },
        { type: 'total', label: 'Summa anläggningstillgångar', values: balance_sheet.total_fixed_assets },
        
        { type: 'main', label: 'Omsättningstillgångar' },
        { type: 'sub-main', label: 'Varulager m.m.', values: balance_sheet.inventory },
        { type: 'sub', label: 'Färdiga varor och handelsvaror', values: balance_sheet.inventory, accountRange: { start: 1400, end: 1499 } },
        { type: 'sub-main', label: 'Kortfristiga fordringar', values: balance_sheet.current_receivables },
        { type: 'sub', label: 'Kundfordringar', values: balance_sheet.accounts_receivable || { current: 0, previous: 0 }, accountRange: { start: 1500, end: 1519 } },
        { type: 'sub', label: 'Övriga fordringar', values: balance_sheet.other_receivables || { current: 0, previous: 0 }, accountRange: { start: 1600, end: 1699 } },
        { type: 'sub', label: 'Förutbetalda kostnader och upplupna intäkter', values: balance_sheet.prepaid_expenses || { current: 0, previous: 0 }, accountRange: { start: 1700, end: 1799 } },
        { type: 'sub-main', label: 'Kassa och bank', values: balance_sheet.cash_and_bank, accountRange: { start: 1900, end: 1999 } },
        { type: 'total', label: 'Summa omsättningstillgångar', values: balance_sheet.total_current_assets },
        
        { type: 'grand-total', label: 'SUMMA TILLGÅNGAR', values: total_assets },
        
        { type: 'header', label: 'EGET KAPITAL OCH SKULDER' },
        { type: 'main', label: 'Eget kapital' },
        { type: 'sub-main', label: 'Bundet eget kapital' },
        { type: 'sub', label: 'Aktiekapital', values: balance_sheet.restricted_equity, accountRange: { start: 2081, end: 2081 } },
        { type: 'sub-main', label: 'Fritt eget kapital' },
        { type: 'sub', label: 'Balanserat resultat', values: balance_sheet.free_equity_retained, accountRange: { start: 2091, end: 2091 } },
        { type: 'sub', label: 'Årets resultat', values: balance_sheet.profit_loss_for_equity },
        { type: 'total', label: 'Summa eget kapital', values: balance_sheet.total_equity },
        
        { type: 'main', label: 'Obeskattade reserver' },
        { type: 'sub', label: 'Periodiseringsfonder', values: balance_sheet.untaxed_reserves, accountRange: { start: 2100, end: 2199 } },
        
        { type: 'main', label: 'Långfristiga skulder' },
        { type: 'sub', label: 'Övriga skulder till kreditinstitut', values: balance_sheet.long_term_liabilities, accountRange: { start: 2300, end: 2399 } },
        
        { type: 'main', label: 'Kortfristiga skulder' },
        { type: 'sub', label: 'Leverantörsskulder', values: balance_sheet.accounts_payable || { current: 0, previous: 0 }, accountRange: { start: 2440, end: 2449 } },
        { type: 'sub', label: 'Skatteskulder', values: balance_sheet.tax_liabilities || { current: 0, previous: 0 }, accountRange: { start: 2500, end: 2599 } },
        { type: 'sub', label: 'Övriga skulder', values: balance_sheet.other_liabilities || { current: 0, previous: 0 }, accountRange: { start: 2600, end: 2899 } },
        { type: 'sub', label: 'Upplupna kostnader och förutbetalda intäkter', values: balance_sheet.accrued_expenses || { current: 0, previous: 0 }, accountRange: { start: 2900, end: 2999 } },
        { type: 'total', label: 'Summa kortfristiga skulder', values: balance_sheet.current_liabilities },

        { type: 'grand-total', label: 'SUMMA EGET KAPITAL OCH SKULDER', values: total_equity_and_liabilities },
      ],
      balanceCheck: balance_check,
    };

  return (
    // NY DESIGN: Samma "magiska" design som i resultaträkningen.
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 overflow-hidden">
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight text-center">Balansräkning</h2>
          <p className="text-center text-gray-500 mt-2">Enligt K2-regelverket. Klicka på en siffra för att redigera.</p>
        </div>
        
        <div className="px-6 pt-4 flex justify-end">
            <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                {showAll ? <FiMinusCircle/> : <FiPlusCircle/>}
                {showAll ? 'Visa färre poster' : 'Visa alla poster'}
            </button>
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
              {reportData.rows.map((row, index) => (
                <EditableRow 
                  key={index}
                  label={row.label}
                  values={row.values}
                  type={row.type}
                  show={showAll || (row.values && (row.values.current !== 0 || row.values.previous !== 0)) || ['header', 'main', 'total', 'grand-total', 'sub-main'].includes(row.type)}
                  accountRange={row.accountRange}
                  onValueChange={onValueChange}
                />
              ))}
            </tbody>
          </table>
        </div>

        {reportData.balanceCheck.current !== 0 && (
            <div className="m-6 flex items-center bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg shadow-md" role="alert">
                <FiAlertTriangle className="h-6 w-6 mr-4 flex-shrink-0" />
                <div>
                    <p className="font-bold">Balanskontroll misslyckades!</p>
                    <p className="text-sm">Summa tillgångar och Summa eget kapital och skulder balanserar inte. Differens: {formatNumber(reportData.balanceCheck.current)} kr.</p>
                </div>
            </div>
        )}

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

export default Step3_Balansrakning;
