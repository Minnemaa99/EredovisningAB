import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { EditableRow } from './EditableRow';

const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

const Step3_Balansrakning = ({ k2Results, onNext, onBack, onValueChange }) => {
  const { balance_sheet, total_assets, total_equity_and_liabilities, balance_check } = k2Results;

  const reportData = {
      rows: [
        { type: 'header', label: 'TILLGÅNGAR' },
        { type: 'main', label: 'Anläggningstillgångar' },
        { type: 'sub', label: 'Materiella anläggningstillgångar', values: balance_sheet.fixed_assets_tangible, accountRange: { start: 1100, end: 1299 } },
        { type: 'total', label: 'Summa anläggningstillgångar', values: balance_sheet.total_fixed_assets },
        
        { type: 'main', label: 'Omsättningstillgångar' },
        { type: 'sub', label: 'Varulager m.m.', values: balance_sheet.inventory, accountRange: { start: 1400, end: 1499 } },
        { type: 'sub', label: 'Kortfristiga fordringar', values: balance_sheet.current_receivables, accountRange: { start: 1500, end: 1799 } },
        { type: 'sub', label: 'Kassa och bank', values: balance_sheet.cash_and_bank, accountRange: { start: 1900, end: 1999 } },
        { type: 'total', label: 'Summa omsättningstillgångar', values: balance_sheet.total_current_assets },
        
        { type: 'grand-total', label: 'SUMMA TILLGÅNGAR', values: total_assets },
        
        { type: 'header', label: 'EGET KAPITAL OCH SKULDER' },
        { type: 'main', label: 'Eget kapital' },
        { type: 'sub', label: 'Bundet eget kapital', values: balance_sheet.restricted_equity, accountRange: { start: 2080, end: 2089 } },
        { type: 'sub', label: 'Balanserat resultat', values: balance_sheet.free_equity_retained, accountRange: { start: 2090, end: 2098 } },
        { type: 'sub', label: 'Årets resultat', values: balance_sheet.profit_loss_for_equity },
        { type: 'total', label: 'Summa eget kapital', values: balance_sheet.total_equity },
        
        { type: 'main', label: 'Obeskattade reserver', values: balance_sheet.untaxed_reserves, accountRange: { start: 2100, end: 2199 } },
        
        { type: 'main', label: 'Långfristiga skulder', values: balance_sheet.long_term_liabilities, accountRange: { start: 2300, end: 2399 } },
        
        { type: 'main', label: 'Kortfristiga skulder', values: balance_sheet.current_liabilities, accountRange: { start: 2400, end: 2999 } },
        
        { type: 'grand-total', label: 'SUMMA EGET KAPITAL OCH SKULDER', values: total_equity_and_liabilities },
      ],
      balanceCheck: balance_check,
    };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Balansräkning</h2>
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
            {reportData.rows.map((row, index) => (
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

export default Step3_Balansrakning;
