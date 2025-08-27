import React from 'react';
import NoteField from './NoteField';

const formatNumber = (num: number | null | undefined) => num != null ? Math.round(num).toLocaleString('sv-SE') : '0';

interface TangibleAssetsData {
  ingAnsk?: number;
  ingAvsk?: number;
  aretsKop?: number;
  aretsAvsk?: number;
}

interface TangibleAssetsNoteProps {
  data: TangibleAssetsData;
  onChange: (data: TangibleAssetsData) => void;
  totalValue: number;
}

const TangibleAssetsNote: React.FC<TangibleAssetsNoteProps> = ({ data, onChange, totalValue }) => {
  const handle = (e: React.ChangeEvent<HTMLInputElement>, field: keyof TangibleAssetsData) => {
    onChange({ ...data, [field]: parseFloat(e.target.value) || 0 });
  };

  const calculatedTotal = (data.ingAnsk || 0) - (data.ingAvsk || 0) + (data.aretsKop || 0) - (data.aretsAvsk || 0);
  const isValid = Math.round(calculatedTotal) === Math.round(totalValue);

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <NoteField label="Ingående anskaffningsvärde" value={data.ingAnsk} onChange={e => handle(e, 'ingAnsk')} />
      <NoteField label="Ingående ack. avskrivningar" value={data.ingAvsk} onChange={e => handle(e, 'ingAvsk')} />
      <NoteField label="Årets inköp" value={data.aretsKop} onChange={e => handle(e, 'aretsKop')} />
      <NoteField label="Årets avskrivningar" value={data.aretsAvsk} onChange={e => handle(e, 'aretsAvsk')} />
      <hr className="my-2" />
      <div className={`grid grid-cols-2 gap-4 items-center font-bold ${isValid ? 'text-gray-800' : 'text-red-600'}`}>
        <span>Bokfört värde vid årets slut</span>
        <span className="text-right">{formatNumber(calculatedTotal)}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 items-center text-sm text-gray-500">
        <span>(Ska stämma med balansräkningen)</span>
        <span className="text-right">({formatNumber(totalValue)})</span>
      </div>
    </div>
  );
};

export default TangibleAssetsNote;