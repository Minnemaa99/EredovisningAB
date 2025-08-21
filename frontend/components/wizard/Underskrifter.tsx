import React from 'react';

const Underskrifter = ({ nextStep, prevStep }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Underskrifter</h2>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-gray-700">
          Här fyller användaren i ort, datum, och namnen på styrelseledamöter/VD
          som ska skriva under årsredovisningen.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">Ort</label>
            <input type="text" className="w-full mt-1 p-2 border rounded" defaultValue="Helsingborg" />
          </div>
          <div>
            <label className="block text-sm font-medium">Datum</label>
            <input type="date" className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Styrelseledamot/VD</label>
            <input type="text" className="w-full mt-1 p-2 border rounded" placeholder="Anna Andersson" />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Föregående
        </button>
        <button onClick={nextStep} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">
          Gå till Förhandsgranskning
        </button>
      </div>
    </div>
  );
};

export default Underskrifter;
