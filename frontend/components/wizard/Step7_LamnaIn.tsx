import React, { useState } from 'react';
import { FaFilePdf, FaSpinner } from 'react-icons/fa';

const Step7_LamnaIn = ({ onSave, onPreview, onBack }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setIsLoading(true);
    setError('');
    setPreviewUrl(null);
    try {
      const url = await onPreview(); // onPreview should now return a URL
      if (url) {
        setPreviewUrl(url);
      } else {
        throw new Error("Kunde inte generera förhandsgranskning.");
      }
    } catch (err) {
      setError(err.message || 'Ett okänt fel uppstod.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Granska och Skapa Rapport</h2>
      <p className="mb-6 text-gray-600">
        Här kan du förhandsgranska din årsredovisning. När du är nöjd, klicka på "Spara & Skapa Rapport" för att generera den slutgiltiga versionen.
      </p>

      {/* Preview Section */}
      <div className="w-full h-96 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 mb-6">
        {isLoading ? (
          <div className="text-center text-gray-500">
            <FaSpinner className="animate-spin text-4xl mx-auto mb-2" />
            <p>Genererar förhandsgranskning...</p>
          </div>
        ) : previewUrl ? (
          <iframe src={previewUrl} className="w-full h-full" title="Rapportförhandsgranskning"></iframe>
        ) : (
          <div className="text-center text-gray-500 cursor-pointer" onClick={handlePreview}>
            <FaFilePdf className="text-6xl mx-auto mb-2" />
            <p className="font-semibold">Klicka här för att förhandsgranska PDF</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600 w-full sm:w-auto mb-2 sm:mb-0">
          Tillbaka
        </button>
        <button
          onClick={onSave}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 shadow-lg w-full sm:w-auto"
        >
          Spara & Skapa Slutgiltig Rapport
        </button>
      </div>
    </div>
  );
};

export default Step7_LamnaIn;
