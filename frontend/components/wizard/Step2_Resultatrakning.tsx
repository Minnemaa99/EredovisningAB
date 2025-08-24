// Step2_Resultatrakning.tsx
import React, { useEffect, useState } from "react";

export interface Account {
  account_number: string;
  account_name: string;
  balance: number;
}

export interface ResultatPost {
  label: string;
  accountRanges: [number, number];
  editable?: boolean;
}

interface Props {
  accounts: Account[];
  onNext: (accounts: Account[]) => void;
  onBack: () => void;
}

interface YearResult {
  label: string;
  value: number;
}

const Step2_Resultatrakning: React.FC<Props> = ({
  accounts = [],
  onNext,
  onBack,
}) => {
  const [year0, setYear0] = useState<YearResult[]>([]);
  const [year1, setYear1] = useState<YearResult[]>([]);

  // Definiera poster enligt K2
  const posts: ResultatPost[] = [
    { label: "Nettoomsättning", accountRanges: [3000, 3799] },
    { label: "Förändring av lager", accountRanges: [4900, 4999], editable: true },
    { label: "Övriga rörelseintäkter", accountRanges: [8000, 8099] },
    { label: "Råvaror och förnödenheter", accountRanges: [4000, 4099] },
    { label: "Handelsvaror", accountRanges: [4100, 4199] },
    { label: "Övriga externa kostnader", accountRanges: [6000, 6999] },
    { label: "Personalkostnader", accountRanges: [7000, 7099] },
    { label: "Av- och nedskrivningar", accountRanges: [7800, 7899] },
    { label: "Övriga rörelsekostnader", accountRanges: [7700, 7799] },
    { label: "Övriga ränteintäkter", accountRanges: [8300, 8399] },
    { label: "Räntekostnader", accountRanges: [8400, 8499] },
  ];

  // Summera per intervall
  const sum = (range: [number, number]) =>
    accounts
      .filter((a) => {
        const n = parseInt(a.account_number, 10);
        return n >= range[0] && n <= range[1];
      })
      .reduce((t, a) => t + a.balance, 0);

  useEffect(() => {
    setYear0(posts.map((p) => ({ label: p.label, value: sum(p.accountRanges) })));
    setYear1(posts.map((p) => ({ label: p.label, value: 0 }))); // ← läs in föregående år från #RES -1 eller separat fil
  }, [accounts]);

  // Summering
  const total = (arr: YearResult[]) => arr.reduce((t, r) => t + r.value, 0);

  // Ändringar
  const handleChange = (index: number, year: 0 | 1, val: number) => {
    const arr = year === 0 ? [...year0] : [...year1];
    arr[index].value = val;
    year === 0 ? setYear0(arr) : setYear1(arr);
  };

  const handleNext = () => {
    // Här kan du spara year0 och year1 till nästa steg
    onNext(accounts); // eller skicka summerade värden
  };

  const renderYear = (year: YearResult[], label: string, setter: React.Dispatch<React.SetStateAction<YearResult[]>>) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Post</th>
            <th className="py-2 px-4 text-right">Belopp (kr)</th>
          </tr>
        </thead>
        <tbody>
          {year.map((row, i) => (
            <tr key={row.label} className="border-b">
              <td className="py-2 px-4">{row.label}</td>
              <td className="py-2 px-4 text-right">
                <input
                  type="number"
                  value={row.value}
                  onChange={(e) => handleChange(i, label.includes("2023") ? 0 : 1, parseFloat(e.target.value) || 0)}
                  className="w-32 border rounded px-2 text-right"
                />
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td>Resultat före skatt</td>
            <td className="text-right">{total(year).toLocaleString("sv-SE")} kr</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Resultaträkning (K2)</h2>

      {renderYear(year0, "2023-10-01 – 2024-09-30", setYear0)}
      {renderYear(year1, "2022-10-01 – 2023-09-30", setYear1)}

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="bg-gray-500 text-white px-6 py-2 rounded">Tillbaka</button>
        <button onClick={handleNext} className="bg-blue-500 text-white px-6 py-2 rounded">Nästa (Balansräkning)</button>
      </div>
    </div>
  );
};

export default Step2_Resultatrakning;