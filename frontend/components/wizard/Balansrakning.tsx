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

const Balansrakning = ({ nextStep, prevStep, values, handleChange }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Balansräkning</h2>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg mt-4 border-b pb-2">Tillgångar</h3>
        <ReportRow label="Materiella anläggningstillgångar" fieldName="mat_anl_tillg" value={values.mat_anl_tillg} handleChange={handleChange} />
        <ReportRow label="Varulager m.m." fieldName="varulager" value={values.varulager} handleChange={handleChange} />
        <ReportRow label="Kundfordringar" fieldName="kundfordringar" value={values.kundfordringar} handleChange={handleChange} />
        <ReportRow label="Kassa och bank" fieldName="kassa_bank" value={values.kassa_bank} handleChange={handleChange} />

        <h3 className="font-semibold text-lg mt-4 border-b pb-2">Eget kapital och skulder</h3>
        <ReportRow label="Bundet eget kapital" fieldName="bundet_ek" value={values.bundet_ek} handleChange={handleChange} />
        <ReportRow label="Fritt eget kapital" fieldName="fritt_ek" value={values.fritt_ek} handleChange={handleChange} />
        <ReportRow label="Kortfristiga skulder" fieldName="kortfristiga_skulder" value={values.kortfristiga_skulder} handleChange={handleChange} />
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={prevStep} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Föregående (Resultaträkning)
        </button>
        <button onClick={nextStep} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">
          Nästa (Noter)
        </button>
      </div>
    </div>
  );
};

export default Balansrakning;
