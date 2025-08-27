import React from 'react';

interface NoteFieldProps {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const NoteField: React.FC<NoteFieldProps> = ({ label, value, onChange, type = 'number' }) => (
  <div className="grid grid-cols-2 gap-4 items-center">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      className="p-2 border rounded-md text-right w-full"
    />
  </div>
);

export default NoteField;