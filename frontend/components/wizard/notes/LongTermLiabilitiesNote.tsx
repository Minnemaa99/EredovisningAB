import React from 'react';

const formatNumber = (num: number | null | undefined) => num != null ? Math.round(num).toLocaleString('sv-SE') : '0';

interface LongTermLiabilitiesNoteProps {
  totalValue: number;
}

const LongTermLiabilitiesNote: React.FC<LongTermLiabilitiesNoteProps> = ({ totalValue }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg text-sm">
      <p className="text-gray-600">Bolagets långfristiga skulder består av följande poster:</p>
      <div className="mt-3 grid grid-cols-2 gap-4 items-center font-bold text-gray-800">
        <span>Totalt långfristiga skulder</span>
        <span className="text-right">{formatNumber(totalValue)} kr</span>
      </div>
       <p className="mt-2 text-xs text-gray-500">
        Informationen hämtas från balansräkningen. Om skulderna behöver specificeras ytterligare (t.ex. skulder till kreditinstitut), kan detta göras i förvaltningsberättelsen.
      </p>
    </div>
  );
};

export default LongTermLiabilitiesNote;