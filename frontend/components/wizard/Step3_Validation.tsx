import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Step3_Validation = ({ nextStep, prevStep, reportId }) => {
  const [reportData, setReportData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportId) return;
      setIsLoading(true);
      try {
        // In a real app, you might have a dedicated endpoint to get the report data.
        // For now, we'll assume the validation endpoint returns enough info.
        const response = await axios.post(`/api/annual-reports/${reportId}/validate`);
        setValidationResult(response.data);
        // We'll also fetch the full report data to display a summary
        // This endpoint doesn't exist yet, so this is a placeholder for the concept.
        // const reportResponse = await axios.get(`/api/annual-reports/${reportId}`);
        // setReportData(reportResponse.data);

      } catch (error) {
        console.error("Failed to fetch or validate data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  if (isLoading) {
    return <div>Laddar och validerar data...</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Granska och Validera</h3>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold">Valideringsstatus</h4>
        {validationResult ? (
          <div className={validationResult.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
            Status: {validationResult.status}
            {validationResult.errors && validationResult.errors.length > 0 && (
              <ul className="list-disc pl-5 mt-2">
                {validationResult.errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p>Kunde inte köra validering.</p>
        )}
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold">Datasummering</h4>
        <p>Här skulle en sammanfattning av den importerade datan visas, t.ex. en lista på konton och saldon.</p>
        {/* Placeholder for data summary */}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Föregående
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700"
          disabled={validationResult?.status !== 'ok'}
        >
          Nästa
        </button>
      </div>
    </div>
  );
};

export default Step3_Validation;
