import React from "react";

export default function CompanyTypeSelector({ onSelect }: { onSelect: (type: "ab" | "enskild") => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Välj företagsform</h1>
      <div className="flex gap-8">
        <button
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => onSelect("ab")}
        >
          Aktiebolag
        </button>
        <button
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          onClick={() => onSelect("enskild")}
        >
          Enskild firma
        </button>
      </div>
    </div>
  );
}