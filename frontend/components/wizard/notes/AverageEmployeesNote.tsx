import React from 'react';
import NoteField from './NoteField';

interface AverageEmployeesData {
  employees?: number;
}

interface AverageEmployeesNoteProps {
  data: AverageEmployeesData;
  onChange: (data: AverageEmployeesData) => void;
}

const AverageEmployeesNote: React.FC<AverageEmployeesNoteProps> = ({ data, onChange }) => {
  const handle = (e: React.ChangeEvent<HTMLInputElement>, field: keyof AverageEmployeesData) => {
    onChange({ ...data, [field]: parseInt(e.target.value, 10) || 0 });
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <NoteField label="Antal anställda i Sverige" value={data.employees} onChange={e => handle(e, 'employees')} />
    </div>
  );
};

export default AverageEmployeesNote;