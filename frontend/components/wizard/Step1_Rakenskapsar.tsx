import React, { useState } from 'react';
import axios from 'axios';

// Definiera typerna för props som komponenten tar emot från Wizard.tsx
interface Props {
  reportDates: {
    start_date: string;
    end_date: string;
  };
  setReportDates: React.Dispatch<React.SetStateAction<{ start_date: string; end_date: string; }>>;
  onUploadSuccess: (data: any) => void;
  onBack: () => void;
}

const Step1_Rakenskapsar: React.FC<Props> = ({
  reportDates,
  setReportDates,
  onUploadSuccess,
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null); // Rensa tidigare fel när en ny fil väljs
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vänligen välj en SIE-fil först.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/annual-reports/upload-sie',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Anropa funktionen från Wizard.tsx med den mottagna datan
      onUploadSuccess(response.data);
    } catch (err: any) {
      console.error("Failed to upload and parse SIE file", err);
      // Sätt ett användarvänligt felmeddelande
      const serverError = err.response?.data?.detail || 'Ett okänt fel inträffade.';
      setError(`Misslyckades att ladda upp fil: ${serverError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Steg 1: Räkenskapsår och Bokföringsdata</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Ladda upp bokföringsdata</h3>
        <p className="text-sm text-gray-600 mb-4">
          Ladda upp en SIE-fil (SIE4) för att automatiskt fylla i din årsredovisning.
          Räkenskapsårets datum kommer att hämtas från filen.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            id="sie-file"
            accept=".se,.si"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="sie-file" className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
            Välj en fil...
          </label>
          {selectedFile && <p className="mt-2 text-gray-700">Vald fil: {selectedFile.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Startdatum</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={reportDates.start_date}
            onChange={(e) => setReportDates(prev => ({ ...prev, start_date: e.target.value }))}
            className="w-full p-2 border rounded-md bg-gray-100"
            readOnly // Datum hämtas från filen, så fältet är skrivskyddat
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
            className="w-full p-2 border rounded-md bg-gray-100"
            readOnly // Datum hämtas från filen, så fältet är skrivskyddat
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
          <strong className="font-bold">Fel: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          disabled={isLoading}
        >
          Tillbaka
        </button>
        <button
          onClick={handleUpload}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Laddar upp...' : 'Ladda upp och fortsätt'}
        </button>
      </div>
    </div>
  );
};

export default Step1_Rakenskapsar;
