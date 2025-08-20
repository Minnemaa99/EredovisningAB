import React from 'react';

const Step2_DataImport = ({ nextStep, prevStep }) => {

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("SIE file selected:", file.name);
      // Here you would typically trigger the file upload to the backend
      // and then proceed to the next step upon success.
      alert("Filuppladdning är inte implementerad än. Går vidare till nästa steg för demonstration.");
      nextStep();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Importera bokföringsdata</h3>

      <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
        <label htmlFor="sie-file-upload" className="cursor-pointer text-blue-600 font-semibold">
          Ladda upp SIE-fil
        </label>
        <input id="sie-file-upload" name="sie-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".se,.si" />
        <p className="text-sm text-gray-500 mt-2">Dra och släpp eller klicka för att ladda upp</p>
      </div>

      <div className="text-center mb-6">
        <p className="text-gray-600">eller</p>
      </div>

      <div className="text-center">
        <button
          onClick={() => alert("Manuell inmatning är inte implementerad än.")}
          className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300"
        >
          Mata in manuellt
        </button>
      </div>

      <div className="my-4 border-t"></div>

      <div className="text-center">
        <button
          onClick={() => alert("Fortnox-integration är inte implementerad än.")}
          className="w-full bg-yellow-400 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-yellow-500"
        >
          Importera från Fortnox
        </button>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Föregående
        </button>
        {/* The "Nästa" button is implicitly handled by the file upload success in this design */}
      </div>
    </div>
  );
};

export default Step2_DataImport;
