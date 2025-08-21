import React from 'react';

// This is a placeholder for a single input row in the form
const ReportRow = ({ label, fieldName, value, handleChange }) => (
  <div className="flex items-center justify-between py-2 border-b">
    <label htmlFor={fieldName} className="text-gray-700">{label}</label>
    <input
      type="number"
      id={fieldName}
      name={fieldName}
      value={value}
      onChange={handleChange}
      className="w-48 p-2 border rounded text-right"
      placeholder="0 kr"
    />
  </div>
);

const Resultatrakning = ({ nextStep, prevStep, values, handleChange }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resultaträkning</h2>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mt-4 border-b pb-2">Rörelsens intäkter</h3>
        <ReportRow label="Nettoomsättning" fieldName="nettoomsattning" value={values.nettoomsattning} handleChange={handleChange} />
        <ReportRow label="Övriga rörelseintäkter" fieldName="ovriga_rorelseintakter" value={values.ovriga_rorelseintakter} handleChange={handleChange} />

        <h3 className="font-semibold text-lg mt-4 border-b pb-2">Rörelsens kostnader</h3>
        <ReportRow label="Råvaror och förnödenheter" fieldName="ravaror_fornoddenheter" value={values.ravaror_fornoddenheter} handleChange={handleChange} />
        <ReportRow label="Handelsvaror" fieldName="handelsvaror" value={values.handelsvaror} handleChange={handleChange} />
        <ReportRow label="Externa kostnader" fieldName="externa_kostnader" value={values.externa_kostnader} handleChange={handleChange} />
        <ReportRow label="Personalkostnader" fieldName="personalkostnader" value={values.personalkostnader} handleChange={handleChange} />
        <ReportRow label="Avskrivningar" fieldName="avskrivningar" value={values.avskrivningar} handleChange={handleChange} />

        {/* More fields would be added here based on the full K2 schema */}

      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Föregående
        </button>
        <button onClick={nextStep} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">
          Nästa (Balansräkning)
        </button>
      </div>
    </div>
  );
};

export default Resultatrakning;
