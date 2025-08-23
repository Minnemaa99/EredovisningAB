import React, { useState } from 'react';
import axios from 'axios';

const Step1_Rakenskapsar = ({ reportDates, setReportDates, onUploadSuccess, onNext }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadChoice, setUploadChoice] = useState(false);

  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/annual-reports/upload-sie`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("Upload response data:", response.data);

      onUploadSuccess(response.data);
      setIsLoading(false);
      onNext(); 
    } catch (error) {
      console.error("Failed to upload and parse SIE file", error);

      if (error.response) {
        console.log("Server responded with:", error.response.data);
        console.log("Status:", error.response.status);
      } else if (error.request) {
        console.log("No response received, request was:", error.request);
      } else {
        console.log("Error setting up request:", error.message);
      }

      alert("Kunde inte analysera filen. Kontrollera att det är en giltig SIE-fil.");
      setIsLoading(false);
    }
  }
};


  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Räkenskapsår och Data</h2>
      <p className="mb-6 text-gray-600">Ange räkenskapsårets start- och slutdatum. Ladda sedan upp en SIE-fil för att automatiskt fylla i rapporten.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={reportDates.start_date}
            onChange={(e) => setReportDates(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">Slutdatum</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={reportDates.end_date}
            onChange={(e) => setReportDates(prev => ({ ...prev, end_date: e.target.value }))}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

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
          accept=".se,.si,.sie"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-500 mt-2">Filen kommer att analyseras för att automatiskt fylla i din rapport.</p>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600"
          disabled={isLoading}
        >
          Nästa
        </button>
      </div>
    </div>
  );
};

export default Step1_Rakenskapsar;
