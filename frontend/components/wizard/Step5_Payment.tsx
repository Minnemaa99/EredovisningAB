import React, { useState } from 'react';
import axios from 'axios';

const Step5_Payment = ({ prevStep, reportId }) => {
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!reportId) return;
    setIsLoading(true);
    setError(null);

    try {
      // This endpoint simulates the payment process
      await axios.post(`/api/annual-reports/${reportId}/pay`);
      setIsPaid(true);
    } catch (err) {
      setError('Betalningen misslyckades. Försök igen.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (type: 'pdf' | 'sru') => {
    // In a real app, you'd trigger a download from the backend
    window.open(`/api/annual-reports/${reportId}/download-${type}`, '_blank');
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Steg 5: Betalning och Nedladdning</h3>

      {!isPaid ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-700">Du är nu redo att slutföra din årsredovisning.</p>
          <p className="text-4xl font-bold my-4">899 kr</p>
          <button
            onClick={handlePayment}
            disabled={isLoading}
            className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Bearbetar...' : 'Betala och slutför'}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        <div className="text-center p-8 bg-green-50 rounded-lg">
          <h4 className="text-2xl font-bold text-green-700">Tack för din betalning!</h4>
          <p className="mt-4 text-gray-700">Nu kan du ladda ner dina färdiga dokument.</p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => handleDownload('pdf')}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700"
            >
              Ladda ner Årsredovisning (PDF)
            </button>
            <button
              onClick={() => handleDownload('sru')}
              className="bg-gray-700 text-white font-bold py-3 px-6 rounded-full hover:bg-gray-800"
            >
              Ladda ner Deklaration (SRU)
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-between">
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

export default Step5_Payment;
