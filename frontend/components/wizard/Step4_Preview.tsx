import React, { useState } from 'react';
import axios from 'axios';

const Step4_Preview = ({ nextStep, prevStep, reportId }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    if (!reportId) return;
    setIsLoading(true);
    setError(null);
    setPdfUrl(null);

    try {
      const response = await axios.get(`/api/annual-reports/${reportId}/preview`, {
        responseType: 'blob', // Important to handle the binary PDF data
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      setPdfUrl(fileURL);
    } catch (err) {
      setError('Kunde inte generera förhandsgranskning.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Förhandsgranska rapport</h3>

      {!pdfUrl && (
        <div className="text-center">
          <button
            onClick={generatePreview}
            disabled={isLoading}
            className="bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Genererar...' : 'Generera förhandsgranskning'}
          </button>
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {pdfUrl && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <iframe src={pdfUrl} width="100%" height="500px" title="PDF Preview" />
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Föregående
        </button>
        <button
          onClick={nextStep}
          disabled={!pdfUrl}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
        >
          Nästa
        </button>
      </div>
    </div>
  );
};

export default Step4_Preview;
