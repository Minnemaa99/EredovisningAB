import React from 'react';

// This is a simplified version. In a real app, you'd have more robust validation.
const Step1_CompanyInfo = ({ nextStep, handleChange, values }) => {
  const continueStep = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={continueStep}>
      <h3 className="text-lg font-medium mb-4">Företagsuppgifter</h3>
      <div className="mb-4">
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
          Företagsnamn
        </label>
        <input
          type="text"
          name="companyName"
          id="companyName"
          value={values.companyName}
          onChange={handleChange('companyName')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="orgnummer" className="block text-sm font-medium text-gray-700">
          Organisationsnummer
        </label>
        <input
          type="text"
          name="orgnummer"
          id="orgnummer"
          value={values.orgnummer}
          onChange={handleChange('orgnummer')}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div className="text-right">
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700"
        >
          Nästa
        </button>
      </div>
    </form>
  );
};

export default Step1_CompanyInfo;
