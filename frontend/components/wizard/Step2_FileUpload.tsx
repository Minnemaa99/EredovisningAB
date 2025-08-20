import React from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Step2_FileUpload = ({ nextStep, onBack, reportId }) => {

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(`${API_BASE_URL}/api/annual-reports/${reportId}/import-sie`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        nextStep();
      } catch (error) {
        console.error("Failed to upload SIE file", error);
        alert("Kunde inte ladda upp filen. Försök igen.");
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Ladda upp SIE-fil</h3>

      <div className="mb-6 p-6 border-2 border-dashed rounded-lg text-center">
        <label htmlFor="sie-file-upload" className="cursor-pointer text-blue-600 font-semibold">
          Välj fil
        </label>
        <input id="sie-file-upload" name="sie-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".se,.si" />
        <p className="text-sm text-gray-500 mt-2">Dra och släpp eller klicka för att ladda upp</p>
      </div>

      <div className="mt-8">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
};

export default Step2_FileUpload;
