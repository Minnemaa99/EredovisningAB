import React, { useState, useEffect } from 'react';

interface EditableRowProps {
  label: React.ReactNode;
  values?: { current?: number; previous?: number; note_ref?: number | null } | null;
  type?: 'main' | 'sub' | 'total' | 'grand-total' | 'header';
  show?: boolean;
  accountRange?: { start: number; end: number } | null;
  displayNegative?: boolean;
  highlight?: boolean;
  onValueChange?: (accountRange: { start: number; end: number } | undefined, newValue: number, oldValue: number) => void;
}

const formatNumber = (num?: number | null) => {
  if (num === undefined || num === null) return '';
  // Visa "0" istället för tomt
  if (num === 0) return '0';
  return Math.round(Math.abs(num)).toLocaleString('sv-SE');
};

const parseInput = (s: string) => {
  const cleaned = String(s).replace(/\s|,/g, '').replace(/\u00A0/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : Math.round(n);
};

export const EditableRow: React.FC<EditableRowProps> = ({ label, values, type = 'sub', show = true, accountRange, displayNegative = false, highlight = false, onValueChange }) => {
  const [curInput, setCurInput] = useState<string>(values && values.current !== undefined ? String(values.current) : '');
  const [prevInput, setPrevInput] = useState<string>(values && values.previous !== undefined ? String(values.previous) : '');

  useEffect(() => {
    setCurInput(values && values.current !== undefined ? String(values.current) : '');
    setPrevInput(values && values.previous !== undefined ? String(values.previous) : '');
  }, [values]);

  if (!show) return null;

  const isEditable = !!accountRange;

  // label: svart/fet om highlight är true
  const labelClass = `max-w-[340px] whitespace-normal break-words leading-snug text-sm ${highlight ? 'text-black font-semibold' : (type === 'total' ? 'text-black' : 'text-gray-700')}`;

  // value-klass: gör värdet mörkare/fetare när highlight är true
  const valueClass = highlight ? 'pr-2 font-semibold text-gray-900' : (type === 'grand-total' ? 'pr-2 font-extrabold text-gray-900' : 'pr-2 text-gray-700');

  const inputClass = "w-28 px-2 py-1 text-right border border-gray-200 rounded-md bg-white text-sm font-mono";

  const formatCell = (num?: number | null, negativeFlag = false) => {
    if (num === undefined || num === null) return '';
    // Visa "0" istället för tomt så att input kan fyllas
    if (num === 0) return '0';
    const absStr = formatNumber(Math.abs(num));
    if (negativeFlag) return `-${absStr}`;
    return num < 0 ? `-${absStr}` : absStr;
  };

  // Debug: logga highlight-rader (ta bort efter felsökning)
  useEffect(() => {
    if (highlight) {
      // eslint-disable-next-line no-console
      console.log('DEBUG EditableRow highlight:', { label, values });
    }
  }, [highlight, label, values]);

  return (
    <tr className="border-b last:border-b-0">
      <td className="px-3 py-3 align-top">
        <div className={labelClass}>
          {label}
        </div>
      </td>

      <td className="px-2 py-3 whitespace-nowrap text-center text-sm text-gray-400">
        {values?.note_ref ?? ''}
      </td>

      <td className="px-2 py-3 whitespace-nowrap text-right">
        {isEditable ? (
          <input
            type="text"
            className={inputClass}
            value={curInput !== '' ? formatNumber(parseInput(curInput)) : ''}
            onChange={(e) => setCurInput(e.target.value)}
            onBlur={() => {
              if (!onValueChange) return;
              const newVal = parseInput(curInput);
              onValueChange(accountRange, newVal, values?.current ?? 0);
              setCurInput(String(newVal));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        ) : (
          <div className={valueClass}>
            {formatCell(values?.current, displayNegative)}
            {(type === 'total' || type === 'grand-total') && (values?.current !== undefined && values?.current !== null) ? ' kr' : ''}
          </div>
        )}
      </td>

      <td className="px-2 py-3 whitespace-nowrap text-right">
        {isEditable ? (
          <input
            type="text"
            className={inputClass + " bg-gray-50"}
            value={prevInput !== '' ? formatNumber(parseInput(prevInput)) : ''}
            onChange={(e) => setPrevInput(e.target.value)}
            onBlur={() => {
              if (!onValueChange) return;
              const newVal = parseInput(prevInput);
              onValueChange(accountRange, newVal, values?.previous ?? 0);
              setPrevInput(String(newVal));
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
          />
        ) : (
          <div className="text-gray-500">
            {formatCell(values?.previous, displayNegative)}
            {(type === 'total' || type === 'grand-total') && (values?.previous !== undefined && values?.previous !== null) ? ' kr' : ''}
          </div>
        )}
      </td>
    </tr>
  );
};

export default EditableRow;