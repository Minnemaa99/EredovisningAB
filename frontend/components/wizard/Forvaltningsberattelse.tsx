import React from 'react';

const Forvaltningsberattelse = ({ nextStep, prevStep }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Förvaltningsberättelse</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-700">
          Här skulle användaren fylla i texten för förvaltningsberättelsen.
          Detta inkluderar information om företagets utveckling, viktiga händelser
          under året, och framtidsutsikter.
        </p>
        <textarea
          className="w-full mt-4 p-2 border rounded"
          rows="15"
          placeholder="Skriv förvaltningsberättelse här..."
        ></textarea>
      </div>
      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Föregående
        </button>
        <button onClick={nextStep} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">
          Nästa
        </button>
      </div>
    </div>
  );
};

export default Forvaltningsberattelse;
