import React from "react";

const BLANKETTER = {
  ab: ["INK2", "K10", "K4", "Bilagor"],
  enskild: ["NE", "K10", "K4", "Bilagor"],
};

export default function BlankettDropdown({
  companyType,
  onSelect,
}: {
  companyType: "ab" | "enskild";
  onSelect: (blankett: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold mb-4">Välj blankett</h2>

      <select
        className="w-full max-w-xs px-4 py-2 border rounded bg-white"
        onChange={e => onSelect(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Välj blankett...</option>
        {BLANKETTER[companyType].map(b => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  );
}