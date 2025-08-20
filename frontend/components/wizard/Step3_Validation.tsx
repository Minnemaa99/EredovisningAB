import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const Step3_Validation = ({ nextStep, prevStep, reportId }) => {
  const [reportData, setReportData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!reportId) return;
      setIsLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/annual-reports/${reportId}/validate`);
        setValidationResult(response.data);
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

  const summary = validationResult?.summary;
  const accountBalances = summary?.account_balances || {};

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Granska och Validera</h3>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-semibold">Valideringsstatus</h4>
        {validationResult ? (
          <div className={validationResult.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
            <p className="font-bold">Status: {validationResult.status === 'ok' ? 'Allt ser bra ut!' : 'Fel hittades'}</p>
            {validationResult.errors && validationResult.errors.length > 0 && (
              <ul className="list-disc pl-5 mt-2 text-sm">
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

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold">Kontosaldon</h4>
        {summary ? (
          <table className="min-w-full mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Konto</th>
                <th className="py-2 px-4 border-b text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(accountBalances).map(([account, balance]) => (
                <tr key={account}>
                  <td className="py-2 px-4 border-b">{account}</td>
                  <td className="py-2 px-4 border-b text-right">{Number(balance).toFixed(2)} kr</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Ingen data att visa.</p>
        )}
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
