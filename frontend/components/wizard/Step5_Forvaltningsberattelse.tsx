import React, { useState, useEffect } from 'react';
import { FiFileText, FiTrendingUp, FiDollarSign, FiInfo } from 'react-icons/fi';

// --- Typer och hjälpfunktioner ---
interface Props {
  k2Results: any;
  onSave: (text: string) => void;
  onBack: () => void;
  dividend: number;
  onDividendChange: (amount: number) => void;
}

const formatNumber = (num: number, decimals = 0) => {
    if (isNaN(num)) return '0';
    return num.toLocaleString('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input type="checkbox" name={label} id={label} checked={enabled} onChange={() => setEnabled(!enabled)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:bg-blue-600"/>
        <label htmlFor={label} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
      </div>
    </div>
);

// --- Huvudkomponenten ---

const Step5_Forvaltningsberattelse: React.FC<Props> = ({ 
  k2Results, 
  onSave, 
  onBack,
  dividend,
  onDividendChange
}) => {
  // --- TRACEBACK STEG 3: Definitiv spårning av props vid varje rendering ---
  console.log(`--- TRACEBACK 3: [Step5] Renderar. Mottagen k2Results:`, k2Results);

  // GARDERA MOT OFULLSTÄNDIG DATA: Kontrollera om k2Results och nödvändiga nycklar finns.
  if (!k2Results || !k2Results.balance_sheet || !k2Results.balance_sheet.solvency_ratio) {
    // Logga exakt vad som misslyckades
    console.error("--- TRACEBACK 3.1: [Step5] Guard clause misslyckades. Anledning:");
    if (!k2Results) {
        console.error(" -> k2Results är falsy (t.ex. null eller undefined).");
    } else if (!k2Results.balance_sheet) {
        console.error(" -> k2Results.balance_sheet är falsy.");
    } else if (!k2Results.balance_sheet.solvency_ratio) {
        console.error(" -> k2Results.balance_sheet.solvency_ratio är falsy.");
    }
    
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Dataproblem</h2>
        <p>Väsentlig data för förvaltningsberättelsen saknas.</p>
        <p className="mt-4 text-sm text-gray-700">Teknisk info: `k2Results.balance_sheet.solvency_ratio` är inte tillgänglig.</p>
      </div>
    );
  }

  // --- State-hantering ---
  // Befintliga states för textinmatning
  const [allmantText, setAllmantText] = useState('Bolaget har sitt säte i [STAD]. Verksamheten består av...');
  const [handelserText, setHandelserText] = useState('');
  const [kommentarFlerar, setKommentarFlerar] = useState('');
  // NYTT: State för textfältet "Förändringar i eget kapital"
  const [kommentarForandringarEK, setKommentarForandringarEK] = useState('');

  // Befintliga states för att visa/dölja sektioner
  const [showHandelser, setShowHandelser] = useState(false);
  const [showForandringarEK, setShowForandringarEK] = useState(false);

  // --- Databeräkningar ---
  const { income_statement, balance_sheet, total_assets, profit_loss } = k2Results;
  
  const balanseratResultat = balance_sheet.free_equity_retained.current;
  const aretsResultat = profit_loss.current;
  const tillDisposition = balanseratResultat + aretsResultat;
  const balanserasNyRakning = tillDisposition - dividend;

  // --- Spara-funktion ---
  const handleSaveAndContinue = () => {
    const reportParts: string[] = [];

    if (allmantText.trim()) {
      reportParts.push(`<h3>Allmänt om verksamheten</h3><p>${allmantText.trim()}</p>`);
    }

    if (showHandelser && handelserText.trim()) {
      reportParts.push(`<h3>Väsentliga händelser under räkenskapsåret</h3><p>${handelserText.trim()}</p>`);
    }

    if (kommentarFlerar.trim()) {
        reportParts.push(`<h3>Flerårsöversikt</h3><p>${kommentarFlerar.trim()}</p>`);
    }

    if (showForandringarEK && kommentarForandringarEK.trim()) {
        reportParts.push(`<h3>Förändringar i eget kapital</h3><p>${kommentarForandringarEK.trim()}</p>`);
    }

    const fullText = reportParts.join('\n');
    onSave(fullText);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800">Steg 5: Förvaltningsberättelse</h2>
        <p className="text-center text-gray-500 mt-2">Beskrivning av verksamheten och viktiga händelser.</p>
      </div>

      <SectionCard icon={<FiFileText />} title="Allmänt om verksamheten">
        <textarea value={allmantText} onChange={e => setAllmantText(e.target.value)} rows={4} className="w-full p-2 border rounded-md" />
      </SectionCard>

      <SectionCard icon={<FiInfo />} title="Väsentliga händelser under räkenskapsåret">
        <ToggleSwitch label="Ange väsentliga händelser" enabled={showHandelser} setEnabled={setShowHandelser} />
        {showHandelser && <textarea value={handelserText} onChange={e => setHandelserText(e.target.value)} rows={4} className="w-full p-2 border rounded-md mt-4" placeholder="Beskriv händelser som är av betydelse för företaget..." />}
      </SectionCard>

      <SectionCard icon={<FiTrendingUp />} title="Flerårsöversikt">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="p-2">Nyckeltal</th>
              <th className="p-2 text-right">Aktuellt år</th>
              <th className="p-2 text-right">Föregående år</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="p-2">Nettoomsättning</td>
              <td className="p-2 text-right font-mono">{formatNumber(income_statement.net_sales.current)} kr</td>
              <td className="p-2 text-right font-mono text-gray-500">{formatNumber(income_statement.net_sales.previous)} kr</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="p-2">Resultat efter finansiella poster</td>
              <td className="p-2 text-right font-mono">{formatNumber(income_statement.profit_after_financial_items.current)} kr</td>
              <td className="p-2 text-right font-mono text-gray-500">{formatNumber(income_statement.profit_after_financial_items.previous)} kr</td>
            </tr>
            <tr>
              <td className="p-2">Soliditet</td>
              <td className="p-2 text-right font-mono">{formatNumber(balance_sheet.solvency_ratio.current, 1)} %</td>
              <td className="p-2 text-right font-mono text-gray-500">{formatNumber(balance_sheet.solvency_ratio.previous, 1)} %</td>
            </tr>
          </tbody>
        </table>
        <label className="block mt-4 text-sm font-medium text-gray-700">Kommentar till flerårsöversikt</label>
        <textarea value={kommentarFlerar} onChange={e => setKommentarFlerar(e.target.value)} rows={3} className="w-full p-2 border rounded-md mt-1" placeholder="Kommentera eventuella avvikelser eller trender..."/>
      </SectionCard>

      <SectionCard icon={<FiDollarSign />} title="Resultatdisposition">
        <p className="text-sm mb-4 text-gray-600">Här visas hur årets resultat föreslås fördelas. Ange eventuell utdelning nedan.</p>
        
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
            <DispositionRow label="Balanserat resultat" value={balanseratResultat} />
            <DispositionRow label="Årets resultat" value={aretsResultat} />
            <hr className="my-2"/>
            <DispositionRow label="Summa till förfogande" value={tillDisposition} isTotal={true} />
        </div>

        <div className="mt-6">
          <label htmlFor="dividend" className="block text-sm font-semibold text-gray-700 mb-1">
            Föreslagen utdelning till aktieägare
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">SEK</span>
            <input
              type="number"
              id="dividend"
              name="dividend"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={dividend}
              onChange={(e) => onDividendChange(parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border-t-4 border-blue-500 rounded-b-lg">
            <DispositionRow label="Balanseras i ny räkning" value={balanserasNyRakning} isTotal={true} />
        </div>
      </SectionCard>

      <SectionCard icon={<FiFileText />} title="Förändringar i eget kapital">
        <ToggleSwitch label="Lägg till kommentar om förändringar i eget kapital" enabled={showForandringarEK} setEnabled={setShowForandringarEK} />
        {showForandringarEK && (
          <textarea 
            value={kommentarForandringarEK} 
            onChange={e => setKommentarForandringarEK(e.target.value)} 
            rows={4} 
            className="w-full p-2 border rounded-md mt-4" 
            placeholder="Beskriv eventuella nyemissioner, fondemissioner eller andra händelser som påverkat det egna kapitalet..." 
          />
        )}
      </SectionCard>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">Tillbaka</button>
        <button onClick={handleSaveAndContinue} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">Nästa</button>
      </div>
    </div>
  );
};

const SectionCard = ({ icon, title, children }) => (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full mr-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        {children}
    </div>
);

const DispositionRow = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between items-center ${isTotal ? 'font-bold text-lg' : 'text-sm'}`}>
        <span>{label}</span>
        <span className="font-mono">{formatNumber(value)} kr</span>
    </div>
);

export default Step5_Forvaltningsberattelse;
