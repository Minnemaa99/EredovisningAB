import React, { useRef } from "react";
import { useAnnualReport } from "../../context/AnnualReportContext";
import EditableRow from "../wizard/EditableRow";

export default function BlankettForm({
  companyType,
  blankett,
  importMethod,
}: {
  companyType: "ab" | "enskild";
  blankett: string;
  importMethod: "sie" | "manual";
}) {
  const {
    uploadSie,
    k2Results,
    loading,
    error,
    calculate,
    updateLineValue,
    reportData,
  } = useAnnualReport();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const name = (f.name || "").toLowerCase();
    if (!name.endsWith(".sie") && !name.endsWith(".se") && !name.endsWith(".txt")) {
      alert("Filformatet stöds inte. Välj en .sie, .se eller .txt-fil.");
      return;
    }

    await uploadSie(f);
  };

  return (
    <div className="py-4">
      <h2 className="text-lg font-semibold mb-3">
        {blankett} —{" "}
        {companyType === "ab" ? "Aktiebolag" : "Enskild firma"}
      </h2>

      {importMethod === "sie" && (
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">
            Importera SIE / SE-fil
          </label>
          {/* accept inkluderar .se */}
          <input
            ref={fileRef}
            type="file"
            accept=".sie,.se,.txt"
            onChange={onFileChange}
          />
          <div className="mt-2 text-xs text-gray-500">
            Efter uppladdning fylls blankettrader automatiskt.
          </div>
        </div>
      )}

      {importMethod === "manual" && (
        <div className="mb-4">
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              // starta en tom beräkning / initiera reportData för manuell ifyllnad
              void calculate({ companyType, blankett, manual: true });
            }}
          >
            Starta manuell ifyllnad
          </button>
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-500 mb-2">Laddar...</div>
      )}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      {/* Visa k2-resultat om finns */}
      {k2Results?.lines && k2Results.lines.length > 0 ? (
        <div className="space-y-3 mt-4">
          <div className="text-sm text-gray-600">
            Automatiskt ifyllda rader. Redigera värden vid behov.
          </div>
          <div className="bg-white border rounded p-3">
            {k2Results.lines.map((line) => (
              <EditableRow
                key={line.id}
                id={line.id}
                label={line.label}
                value={line.value ?? 0}
                onChange={(val) => updateLineValue(line.id, val)}
              />
            ))}
          </div>

          <div className="mt-3">
            <button
              className="px-3 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                // spara/beräkna slutgiltigt
                void calculate(reportData);
              }}
            >
              Uppdatera beräkning
            </button>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500 mt-4">
          Inga data att visa än. Importera SIE eller starta manuell ifyllnad.
        </div>
      )}
    </div>
  );
}