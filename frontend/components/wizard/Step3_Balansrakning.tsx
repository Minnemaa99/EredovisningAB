import React, { useState } from 'react';
import { FiAlertTriangle, FiArrowLeft, FiSave } from 'react-icons/fi';
import { EditableRow } from './EditableRow';

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

const Step3_Balansrakning = ({ k2Results, reportDates, onNext, onBack, onValueChange }) => {
  const { balance_sheet, total_assets, total_equity_and_liabilities, balance_check } = k2Results || {};

  // DEBUG: Lägg till för att se vad som skickas till frontend
  // eslint-disable-next-line no-console
  console.log('DEBUG Step3 k2Results:', k2Results);
  // eslint-disable-next-line no-console
  console.log('DEBUG Step3 balance_sheet:', balance_sheet);
  // eslint-disable-next-line no-console
  console.log('DEBUG Step3 accounts_receivable:', balance_sheet?.accounts_receivable);
  // eslint-disable-next-line no-console
  console.log('DEBUG Step3 other_receivables:', balance_sheet?.other_receivables);
  // eslint-disable-next-line no-console
  console.log('DEBUG Step3 prepaid_expenses:', balance_sheet?.prepaid_expenses);

  const currentStart = formatDate(reportDates?.start_date);
  const currentEnd = formatDate(reportDates?.end_date);
  const prev = prevPeriod(reportDates?.start_date, reportDates?.end_date);

  // Uppdaterad reportData som array, med highlight för rubriker
  const reportData = [
    { type: 'header', label: 'Tillgångar', values: total_assets, highlight: true },
    { type: 'main', label: 'Anläggningstillgångar', values: balance_sheet?.total_fixed_assets },
    { type: 'sub-main', label: 'Materiella anläggningstillgångar', values: balance_sheet?.fixed_assets_tangible },
    { type: 'sub', label: 'Inventarier, verktyg och installationer', values: balance_sheet?.fixed_assets_tangible, accountRange: { start: 1200, end: 1229 } },
    { type: 'sub-main', label: 'Finansiella anläggningstillgångar', values: balance_sheet?.fixed_assets_financial || { current: 0, previous: 0 } },
    { type: 'sub', label: 'Lån till delägare eller närstående', values: balance_sheet?.loans_to_shareholders || { current: 0, previous: 0 }, accountRange: { start: 1380, end: 1389 } },

    { type: 'header', label: 'Omsättningstillgångar', values: balance_sheet?.total_current_assets, highlight: true },
    { type: 'sub-main', label: 'Varulager m.m.', values: balance_sheet?.inventory || { current: 0, previous: 0 } },
    { type: 'sub', label: 'Råvaror och förnödenheter', values: balance_sheet?.raw_materials_inventory || { current: 0, previous: 0 }, accountRange: { start: 1410, end: 1419 } },
    { type: 'sub', label: 'Varor under tillverkning', values: balance_sheet?.work_in_progress || { current: 0, previous: 0 }, accountRange: { start: 1420, end: 1429 } },
    { type: 'sub', label: 'Färdiga varor och handelsvaror', values: balance_sheet?.finished_goods || { current: 0, previous: 0 }, accountRange: { start: 1430, end: 1439 } },
    { type: 'sub', label: 'Pågående arbete för annans räkning', values: balance_sheet?.ongoing_work || { current: 0, previous: 0 }, accountRange: { start: 1440, end: 1449 } },
    { type: 'sub', label: 'Förskott till leverantörer', values: balance_sheet?.advances_to_suppliers || { current: 0, previous: 0 }, accountRange: { start: 1450, end: 1459 } },

    { type: 'header', label: 'Kortfristiga fordringar', values: balance_sheet?.current_receivables, highlight: true },
    { type: 'sub', label: 'Kundfordringar', values: balance_sheet?.accounts_receivable || { current: 0, previous: 0 }, accountRange: { start: 1500, end: 1519 } },
    { type: 'sub', label: 'Övriga fordringar', values: balance_sheet?.other_receivables || { current: 0, previous: 0 }, accountRange: { start: 1600, end: 1699 } },
    { type: 'sub', label: 'Upparbetad men ej fakturerad intäkt', values: balance_sheet?.accrued_revenue || { current: 0, previous: 0 }, accountRange: { start: 1520, end: 1529 } },
    { type: 'sub', label: 'Förutbetalda kostnader och upplupna intäkter', values: balance_sheet?.prepaid_expenses || { current: 0, previous: 0 }, accountRange: { start: 1700, end: 1799 } },
    { type: 'sub-main', label: 'Kassa och bank', values: balance_sheet?.cash_and_bank, accountRange: { start: 1900, end: 1999 } },
    { type: 'sub', label: 'Kassa och bank', values: balance_sheet?.cash_and_bank, accountRange: { start: 1900, end: 1999 } },

    { type: 'header', label: 'Eget kapital och skulder', values: total_equity_and_liabilities, highlight: true },
    { type: 'main', label: 'Eget kapital', values: balance_sheet?.total_equity },
    { type: 'sub-main', label: 'Bundet eget kapital', values: balance_sheet?.restricted_equity },
    { type: 'sub', label: 'Aktiekapital', values: balance_sheet?.restricted_equity, accountRange: { start: 2081, end: 2081 } },
    { type: 'sub-main', label: 'Fritt eget kapital', values: {
        current: (balance_sheet?.free_equity_retained?.current || 0) + (balance_sheet?.profit_loss_for_equity?.current || 0),
        previous: (balance_sheet?.free_equity_retained?.previous || 0) + (balance_sheet?.profit_loss_for_equity?.previous || 0)
      } },
    { type: 'sub', label: 'Balanserat resultat', values: balance_sheet?.free_equity_retained, accountRange: { start: 2091, end: 2091 } },
    { type: 'sub', label: 'Årets resultat', values: balance_sheet?.profit_loss_for_equity },

    { type: 'header', label: 'Obeskattade reserver', values: balance_sheet?.untaxed_reserves, highlight: true },
    { type: 'sub', label: 'Periodiseringsfonder', values: balance_sheet?.untaxed_reserves, accountRange: { start: 2100, end: 2199 } },
    { type: 'sub', label: 'Ackumulerade överavskrivningar', values: balance_sheet?.accumulated_depreciation || { current: 0, previous: 0 }, accountRange: { start: 2110, end: 2119 } },

   
    { type: 'header', label: 'Långfristiga skulder', values: balance_sheet?.long_term_liabilities, highlight: true },
    { type: 'sub', label: 'Checkräkningskredit', values: balance_sheet?.check_account_credit || { current: 0, previous: 0 }, accountRange: { start: 2300, end: 2309 } },
    { type: 'sub', label: 'Övriga skulder till kreditinstitut', values: balance_sheet?.other_liabilities_to_credit_institutions || { current: 0, previous: 0 }, accountRange: { start: 2310, end: 2319 } },
    { type: 'sub', label: 'Övriga skulder', values: balance_sheet?.other_long_term_liabilities || { current: 0, previous: 0 }, accountRange: { start: 2320, end: 2399 } },

    { type: 'main', label: 'Kortfristiga skulder' },
    { type: 'header', label: 'Kortfristiga skulder', values: balance_sheet?.current_liabilities, highlight: true },
    { type: 'sub', label: 'Förskott från kunder', values: balance_sheet?.advances_from_customers || { current: 0, previous: 0 }, accountRange: { start: 2400, end: 2439 } }, // Ändra till samma intervall
    { type: 'sub', label: 'Leverantörsskulder', values: balance_sheet?.accounts_payable || { current: 0, previous: 0 }, accountRange: { start: 2440, end: 2449 } },
    { type: 'sub', label: 'Skatteskulder', values: balance_sheet?.tax_liabilities || { current: 0, previous: 0 }, accountRange: { start: 2500, end: 2599 } },
    { type: 'sub', label: 'Övriga skulder', values: balance_sheet?.other_liabilities || { current: 0, previous: 0 }, accountRange: { start: 2600, end: 2899 } },
    { type: 'sub', label: 'Upplupna kostnader och förutbetalda intäkter', values: balance_sheet?.accrued_expenses || { current: 0, previous: 0 }, accountRange: { start: 2900, end: 2999 } },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/30">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Balansräkning</h2>
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
                  onValueChange={onValueChange}
                  highlight={row.highlight}
                />
              ))}
            </tbody>
          </table>
        </div>

        {balance_check && balance_check.current !== 0 && (
          <div className="m-6 flex items-center bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg shadow-md" role="alert">
            <FiAlertTriangle className="h-6 w-6 mr-4 flex-shrink-0" />
            <div>
              <p className="font-bold">Balanskontroll misslyckades!</p>
              <p className="text-sm">Summa tillgångar och Summa eget kapital och skulder balanserar inte. Differens: {Math.round(balance_check.current).toLocaleString('sv-SE')} kr.</p>
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
