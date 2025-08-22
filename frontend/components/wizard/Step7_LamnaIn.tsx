import React from 'react';

const Step7_LamnaIn = ({ reportId, onSave, onPreview, onBack }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Lämna in Årsredovisning</h2>
      <p className="mb-6 text-gray-600">
        Grattis! Du är nästan klar. Klicka på "Spara & Skapa Rapport" för att slutföra processen.
      </p>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Tillbaka
        </button>
        <button
          onClick={onSave}
          className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600"
        >
          Spara & Skapa Rapport
        </button>
      </div>

      <div className="mt-4">
        <button
            onClick={onPreview}
            disabled={!reportId}
            className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 disabled:opacity-50"
        >
            Förhandsgranska PDF
        </button>
      </div>
    </div>
  );
};

export default Step7_LamnaIn;
