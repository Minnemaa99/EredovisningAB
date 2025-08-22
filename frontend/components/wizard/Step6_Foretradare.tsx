import React from 'react';

const Step6_Foretradare = ({ onNext, onBack }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Företrädare</h2>
      <p className="mb-6 text-gray-600">
        Information om företrädare kommer att implementeras här.
      </p>
      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Tillbaka
        </button>
        <button onClick={onNext} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600">
          Nästa
        </button>
      </div>
    </div>
  );
};

export default Step6_Foretradare;
