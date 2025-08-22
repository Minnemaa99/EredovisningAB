import React from 'react';

const Step3_Balansrakning = ({ accounts, onAccountChange, onNext, onBack }) => {
  const balanceSheetAccounts = accounts.filter(acc => {
    const accNum = parseInt(acc.account_number, 10);
    return accNum >= 1000 && accNum < 3000;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Balansräkning</h2>
      <p className="mb-6 text-gray-600">
        Granska och justera saldon för balansräkningen.
      </p>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="py-3 px-6">Kontonummer</th>
              <th scope="col" className="py-3 px-6">Kontonamn</th>
              <th scope="col" className="py-3 px-6 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {balanceSheetAccounts.map((account, index) => {
              // We need the original index to update the state in the parent
              const originalIndex = accounts.findIndex(a => a.account_number === account.account_number);
              return (
                <tr key={`${account.account_number}-${originalIndex}`} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                    {account.account_number}
                  </th>
                  <td className="py-4 px-6">{account.account_name}</td>
                  <td className="py-4 px-6 text-right">
                    <input
                      type="number"
                      value={account.balance}
                      onChange={(e) => onAccountChange(originalIndex, e.target.value)}
                      className="w-32 p-1 border rounded-md text-right bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600">
          Tillbaka
        </button>
        <button onClick={onNext} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600">
          Nästa (Noter)
        </button>
      </div>
    </div>
  );
};

export default Step3_Balansrakning;
