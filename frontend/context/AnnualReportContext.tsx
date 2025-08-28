import React, { createContext, useContext, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

type K2Line = {
  id: string;
  label: string;
  value: number;
};

type K2Result = {
  lines?: K2Line[];
  summary?: Record<string, any>;
};

type AnnualReportState = {
  companyType: "ab" | "enskild" | null;
  importMethod: "sie" | "manual" | null;
  blankett: string | null;
  reportData: any | null;
  k2Results: K2Result | null;
  loading: boolean;
  error: string | null;
  setCompanyType: (t: "ab" | "enskild" | null) => void;
  setImportMethod: (m: "sie" | "manual" | null) => void;
  setBlankett: (b: string | null) => void;
  uploadSie: (file: File) => Promise<void>;
  calculate: (payload?: any) => Promise<void>;
  updateLineValue: (lineId: string, value: number) => void;
};

const AnnualReportContext = createContext<AnnualReportState | undefined>(undefined);

export const AnnualReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyType, setCompanyType] = useState<"ab" | "enskild" | null>(null);
  const [importMethod, setImportMethod] = useState<"sie" | "manual" | null>(null);
  const [blankett, setBlankett] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);
  const [k2Results, setK2Results] = useState<K2Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadSie = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/annual-reports/upload-sie`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const data = await res.json();
      // Förväntar JSON med reportData + k2Results
      setReportData(data.reportData ?? data);
      setK2Results(data.k2Results ?? data.k2_results ?? null);
    } catch (err: any) {
      setError(err.message || "Fel vid uppladdning");
    } finally {
      setLoading(false);
    }
  };

  const calculate = async (payload?: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/annual-reports/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload ?? { reportData }),
      });
      if (!res.ok) throw new Error(`Calculate failed: ${res.statusText}`);
      const data = await res.json();
      setK2Results(data.k2Results ?? data.k2_results ?? data);
      setReportData((prev: any) => ({ ...prev, ...payload }));
    } catch (err: any) {
      setError(err.message || "Beräkning misslyckades");
    } finally {
      setLoading(false);
    }
  };

  const updateLineValue = (lineId: string, value: number) => {
    if (!k2Results?.lines) return;
    const next: K2Result = {
      ...k2Results,
      lines: k2Results.lines.map((l) => (l.id === lineId ? { ...l, value } : l)),
    };
    setK2Results(next);
    // Skicka en snabb uppdatering till backend för omräkning (fire-and-forget)
    void (async () => {
      try {
        await fetch(`${API_BASE}/annual-reports/calculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportData: { ...reportData }, overrides: { [lineId]: value } }),
        });
      } catch {
        // ignore network errors; UI uppdateras lokalt redan
      }
    })();
  };

  return (
    <AnnualReportContext.Provider
      value={{
        companyType,
        importMethod,
        blankett,
        reportData,
        k2Results,
        loading,
        error,
        setCompanyType,
        setImportMethod,
        setBlankett,
        uploadSie,
        calculate,
        updateLineValue,
      }}
    >
      {children}
    </AnnualReportContext.Provider>
  );
};

export const useAnnualReport = () => {
  const ctx = useContext(AnnualReportContext);
  if (!ctx) throw new Error("useAnnualReport must be used within AnnualReportProvider");
  return ctx;
};