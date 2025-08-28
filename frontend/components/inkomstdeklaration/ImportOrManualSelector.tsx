import React from "react";

export default function ImportOrManualSelector({ onSelect }: { onSelect: (method: "sie" | "manual") => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-8">Hur vill du börja?</h2>
      <div className="flex gap-8">
        <button
          className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold shadow hover:bg-green-700 transition"
          onClick={() => onSelect("sie")}
        >
          Importera SIE-fil
        </button>
        <button
          className="bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold shadow hover:bg-gray-700 transition"
          onClick={() => onSelect("manual")}
        >
          Fyll i för hand
        </button>
      </div>
    </div>
  );
}