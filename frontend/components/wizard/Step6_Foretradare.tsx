import React, { useState } from 'react';

// Definiera typerna för props
interface Representative {
  name: string;
  role: string;
}

interface SignatureInfo {
  city: string;
  date: string;
}

interface Props {
  onSave: (representatives: Representative[], signatureInfo: SignatureInfo) => void;
  onBack: () => void;
}

const Step6_Foretradare: React.FC<Props> = ({ onSave, onBack }) => {
  const [representatives, setRepresentatives] = useState<Representative[]>([
    { name: '', role: 'Styrelseledamot' }
  ]);
  const [signatureCity, setSignatureCity] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  const handleRepChange = (index: number, field: keyof Representative, value: string) => {
    const newReps = [...representatives];
    newReps[index][field] = value;
    setRepresentatives(newReps);
  };

  const addRepresentative = () => {
    setRepresentatives([...representatives, { name: '', role: 'Styrelseledamot' }]);
  };

  const removeRepresentative = (index: number) => {
    const newReps = representatives.filter((_, i) => i !== index);
    setRepresentatives(newReps);
  };

  const handleSaveAndContinue = () => {
    // Validering för att säkerställa att fält är ifyllda
    if (!signatureCity.trim()) {
      alert('Du måste ange en ort för underskrift.');
      return;
    }
    if (representatives.some(rep => !rep.name.trim() || !rep.role.trim())) {
      alert('Alla företrädares namn och roll måste vara ifyllda.');
      return;
    }
    
    const signatureInfo = { city: signatureCity, date: signatureDate };
    onSave(representatives, signatureInfo);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Företrädare och Underskrift</h2>
      <p className="mb-6 text-gray-600">
        Ange vilka som ska skriva under årsredovisningen samt ort och datum för underskrift.
      </p>

      <div className="space-y-4 mb-8">
        {representatives.map((rep, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
            <input
              type="text"
              placeholder="Namn"
              value={rep.name}
              onChange={(e) => handleRepChange(index, 'name', e.target.value)}
              className="flex-grow p-2 border rounded-md"
            />
            <input
              type="text"
              placeholder="Roll (t.ex. Styrelseledamot)"
              value={rep.role}
              onChange={(e) => handleRepChange(index, 'role', e.target.value)}
              className="flex-grow p-2 border rounded-md"
            />
            {representatives.length > 1 && (
              <button onClick={() => removeRepresentative(index)} className="text-red-500 hover:text-red-700 font-bold">
                Ta bort
              </button>
            )}
          </div>
        ))}
        <button onClick={addRepresentative} className="text-blue-600 hover:text-blue-800 font-semibold">
          + Lägg till företrädare
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="signatureCity" className="block text-sm font-medium text-gray-700 mb-1">Ort för underskrift</label>
          <input
            id="signatureCity"
            type="text"
            value={signatureCity}
            onChange={(e) => setSignatureCity(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="signatureDate" className="block text-sm font-medium text-gray-700 mb-1">Datum för underskrift</label>
          <input
            id="signatureDate"
            type="date"
            value={signatureDate}
            onChange={(e) => setSignatureDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Tillbaka
        </button>
        <button onClick={handleSaveAndContinue} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700">
          Spara och fortsätt
        </button>
      </div>
    </div>
  );
};

export default Step6_Foretradare;
