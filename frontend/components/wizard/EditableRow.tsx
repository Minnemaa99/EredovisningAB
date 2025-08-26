import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface EditableRowProps {
  label: string;
  // Gör `values` valfri för att kunna hantera rubrikrader
  values?: { current: number; previous: number };
  type: 'main' | 'sub' | 'total' | 'grand-total' | 'header';
  show: boolean;
  // Gör `accountRange` valfri
  accountRange?: { start: number; end: number };
  onValueChange: (accountRange: { start: number; end: number }, newValue: number, oldValue: number) => void;
}

const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

const getRowStyle = (type: string) => {
    switch (type) {
      case 'header': return 'font-bold text-lg pt-6 text-gray-800';
      case 'main': return 'font-semibold text-gray-700';
      case 'sub': return 'pl-8 text-gray-600';
      case 'total': return 'font-bold bg-gray-50';
      case 'grand-total': return 'font-extrabold text-lg border-t-2 border-black';
      default: return '';
    }
};

export const EditableRow: React.FC<EditableRowProps> = ({ label, values, type, show, accountRange, onValueChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Fix: Hantera att `values` kan vara undefined.
  const [currentValue, setCurrentValue] = useState(values ? values.current.toString() : '0');

  // Uppdatera internt state om prop från föräldern ändras (efter omberäkning)
  useEffect(() => {
    // Fix: Uppdatera bara om `values` finns.
    if (values) {
      setCurrentValue(values.current.toString());
    }
  }, [values]);

  if (!show) return null;

  const handleSave = () => {
    // Fix: Säkerställ att vi har allt vi behöver innan vi anropar onValueChange.
    if (!values || !accountRange) {
        setIsEditing(false);
        return;
    }
    const newValue = parseFloat(currentValue) || 0;
    onValueChange(accountRange, newValue, values.current);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (values) {
      setCurrentValue(values.current.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Vissa rader (headers, totaler) ska inte vara redigerbara
  const isEditable = (type === 'main' || type === 'sub') && !!values && !!accountRange;

  return (
    <tr className={`${getRowStyle(type)} border-b border-gray-100 last:border-b-0 group`}>
      {/* Fix: Om det är en rubrik, spänn över alla kolumner */}
      {type === 'header' ? (
        <td className="px-2 py-3 whitespace-nowrap" colSpan={3}>{label}</td>
      ) : (
        <>
          <td className="px-2 py-3 whitespace-nowrap">{label}</td>
          <td 
            className={`px-2 py-3 whitespace-nowrap text-right font-mono ${isEditable ? 'cursor-pointer hover:bg-blue-50 rounded-md' : ''}`}
            onClick={() => isEditable && !isEditing && setIsEditing(true)}
          >
            {isEditing ? (
              <div className="flex items-center justify-end space-x-2">
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave} // Spara när man klickar utanför
                  className="w-32 p-1 text-right border border-blue-400 rounded-md"
                  autoFocus
                />
                <button onClick={handleSave} className="text-green-600 hover:text-green-800"><FiCheck /></button>
                <button onClick={handleCancel} className="text-red-600 hover:text-red-800"><FiX /></button>
              </div>
            ) : (
              // Fix: Kontrollera att `values` finns innan formatering
              values ? formatNumber(values.current) : ''
            )}
          </td>
          <td className="px-2 py-3 whitespace-nowrap text-right font-mono text-gray-500">
            {/* Fix: Kontrollera att `values` finns innan formatering */}
            {values ? formatNumber(values.previous) : ''}
          </td>
        </>
      )}
    </tr>
  );
};