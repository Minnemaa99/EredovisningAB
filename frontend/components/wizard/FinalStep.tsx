import React from 'react';

const FinalStep = ({ report }) => {
  if (!report) {
    return <div>Laddar rapportdata...</div>;
  }

  const handlePreview = () => {
    window.open(`/api/annual-reports/${report.id}/preview`, '_blank');
  };

  const handleDownload = () => {
    // This would ideally be behind a payment check
    window.open(`/api/annual-reports/${report.id}/download`, '_blank');
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Klart!</h2>
      <p className="text-gray-700 mb-6">Din årsredovisning är nu sparad och redo. Du kan förhandsgranska den eller ladda ner den slutgiltiga versionen.</p>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handlePreview}
          className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300"
        >
          Visa förhandsgranskning (vattenmärkt)
        </button>
        <button
          onClick={handleDownload}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700"
        >
          Ladda ner slutgiltig PDF
        </button>
      </div>
    </div>
  );
};

export default FinalStep;
