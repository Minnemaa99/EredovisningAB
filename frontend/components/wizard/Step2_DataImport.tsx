import React from 'react';

const Step2_DataImport = ({ setImportMethod, prevStep }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Hur vill du mata in din bokföring?</h3>

      <div className="space-y-4">
        <button
          onClick={() => setImportMethod('import')}
          className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600"
        >
          Ladda upp SIE-fil
        </button>

        <button
          onClick={() => setImportMethod('manual')}
          className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300"
        >
          Mata in manuellt
        </button>

        <div className="my-4 border-t"></div>

        <button
          onClick={() => alert("Fortnox-integration är inte implementerad än.")}
          className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-yellow-500"
        >
          Importera från Fortnox
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Föregående
        </button>
      </div>
    </div>
  );
};

export default Step2_DataImport;
