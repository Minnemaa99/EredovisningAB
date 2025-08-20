import React, { useState } from 'react';

const Step2_ManualEntry = ({ onSave, onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState({
    date: '',
    account: '',
    description: '',
    debit: '',
    credit: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    // Basic validation
    if (!currentTransaction.account || (!currentTransaction.debit && !currentTransaction.credit)) {
      alert('Konto och antingen debet eller kredit måste fyllas i.');
      return;
    }
    setTransactions(prev => [...prev, { ...currentTransaction, id: Date.now() }]);
    // Reset form
    setCurrentTransaction({ date: '', account: '', description: '', debit: '', credit: '' });
  };

  const handleSave = () => {
    // Here you would send the `transactions` array to the backend
    onSave(transactions);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Manuell inmatning av verifikationer</h3>

      {/* Form for new transaction */}
      <form onSubmit={handleAddTransaction} className="grid grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <input type="date" name="date" value={currentTransaction.date} onChange={handleChange} className="p-2 border rounded" placeholder="Datum" />
        <input type="text" name="account" value={currentTransaction.account} onChange={handleChange} className="p-2 border rounded" placeholder="Konto" />
        <input type="text" name="description" value={currentTransaction.description} onChange={handleChange} className="p-2 border rounded" placeholder="Beskrivning" />
        <input type="number" name="debit" value={currentTransaction.debit} onChange={handleChange} className="p-2 border rounded" placeholder="Debet" />
        <input type="number" name="credit" value={currentTransaction.credit} onChange={handleChange} className="p-2 border rounded" placeholder="Kredit" />
        <button type="submit" className="col-span-5 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Lägg till rad</button>
      </form>

      {/* Table of transactions */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Datum</th>
              <th className="py-2 px-4 border-b">Konto</th>
              <th className="py-2 px-4 border-b">Beskrivning</th>
              <th className="py-2 px-4 border-b text-right">Debet</th>
              <th className="py-2 px-4 border-b text-right">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td className="py-2 px-4 border-b">{t.date}</td>
                <td className="py-2 px-4 border-b">{t.account}</td>
                <td className="py-2 px-4 border-b">{t.description}</td>
                <td className="py-2 px-4 border-b text-right">{t.debit}</td>
                <td className="py-2 px-4 border-b text-right">{t.credit}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-gray-500">Inga transaktioner tillagda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Tillbaka
        </button>
        <button onClick={handleSave} className="bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600">
          Spara och fortsätt
        </button>
      </div>
    </div>
  );
};

export default Step2_ManualEntry;
