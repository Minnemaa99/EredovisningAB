import React from 'react';

const Step1_DataChoice = ({ onChoice }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Hur vill du börja?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Option 1: File Upload */}
        <div
          onClick={() => onChoice('import')}
          className="p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 hover:border-blue-500"
        >
          <h3 className="text-xl font-semibold mb-2">Ladda upp SIE-fil</h3>
          <p className="text-gray-600">
            Importera din bokföring automatiskt från ett bokföringsprogram.
          </p>
        </div>

        {/* Option 2: Manual Entry */}
        <div
          onClick={() => onChoice('manual')}
          className="p-8 border rounded-lg text-center cursor-pointer hover:bg-gray-50"
        >
          <h3 className="text-xl font-semibold mb-2">Mata in manuellt</h3>
          <p className="text-gray-600">
            Fyll i balans- och resultaträkningen själv, post för post.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Step1_DataChoice;
