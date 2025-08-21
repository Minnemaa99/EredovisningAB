import React, { useState } from 'react';
import axios from 'axios';

const Step2_FileUpload = ({ onUploadSuccess, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`/api/import/parse-sie`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Pass the parsed data up to the parent Wizard component
        onUploadSuccess(response.data);
      } catch (error) {
        console.error("Failed to upload and parse SIE file", error);
        alert("Kunde inte analysera filen. Kontrollera att det är en giltig SIE-fil.");
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ladda upp SIE-fil</h2>

      <div className="mb-6 p-8 border-2 border-dashed rounded-lg text-center">
        <label htmlFor="sie-file-upload" className="cursor-pointer text-blue-600 font-semibold">
          {isLoading ? 'Bearbetar fil...' : 'Välj en SIE-fil från din dator'}
        </label>
        <input
          id="sie-file-upload"
          name="sie-file-upload"
          type="file"
          className="sr-only"
          onChange={handleFileChange}
          accept=".se,.sie"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-2">Filen kommer att analyseras för att automatiskt fylla i din rapport.</p>
      </div>

      <div className="mt-8">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
          disabled={isLoading}
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
};

export default Step2_FileUpload;
