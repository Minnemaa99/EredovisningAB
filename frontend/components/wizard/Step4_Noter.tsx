import React, { useState, useMemo } from 'react';
import { FiInfo, FiPlusCircle, FiAlertCircle } from 'react-icons/fi';

// --- Typer och hjälpfunktioner ---
interface Props {
  k2Results: any; // Ta emot det färdigberäknade objektet
  onNext: () => void;
  onBack: () => void;
}

const formatNumber = (num: number) => num.toLocaleString('sv-SE');

// --- Sub-komponenter för Not-formulär ---

const NoteField = ({ label, value, onChange, placeholder = "0" }) => (
  <div className="grid grid-cols-2 items-center gap-4 py-1">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-2 py-1 text-right bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

const InventarierNote = ({ totalValue }) => {
  const [data, setData] = useState({ ingAnsk: '', inkop: '', forsalj: '', ingAvsk: '', aretsAvsk: '' });
  const handle = (e, field) => setData({ ...data, [field]: e.target.value });

  const summa = ((Number(data.ingAnsk) || 0) + (Number(data.inkop) || 0) - (Number(data.forsalj) || 0)) - ((Number(data.ingAvsk) || 0) + (Number(data.aretsAvsk) || 0));
  const isValid = Math.round(summa) === Math.round(totalValue);

  return (
    <div className="p-4 bg-white rounded-lg ml-4 mt-2 border-l-4 border-blue-500 space-y-3">
      <div className="flex justify-between font-bold text-sm"><span>Inventarier, verktyg och installationer</span><span>{formatNumber(totalValue)}</span></div>
      <div className="font-semibold text-gray-800">Anskaffningsvärden</div>
      <NoteField label="Ingående anskaffningsvärden" value={data.ingAnsk} onChange={e => handle(e, 'ingAnsk')} />
      <NoteField label="Inköp" value={data.inkop} onChange={e => handle(e, 'inkop')} />
      <NoteField label="Försäljning/utrangeringar" value={data.forsalj} onChange={e => handle(e, 'forsalj')} />
      <div className="font-semibold text-gray-800">Avskrivningar</div>
      <NoteField label="Ingående avskrivningar" value={data.ingAvsk} onChange={e => handle(e, 'ingAvsk')} />
      <NoteField label="Årets avskrivningar" value={data.aretsAvsk} onChange={e => handle(e, 'aretsAvsk')} />
      <hr/>
      <div className="flex justify-between font-bold text-lg"><span>Bokfört värde</span><span>{formatNumber(summa)}</span></div>
      {!isValid && (
        <div className="flex items-center p-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
          <FiAlertCircle className="mr-2"/> Summan måste vara samma som redovisat värde i balansräkningen.
        </div>
      )}
    </div>
  );
};

const FordringarNote = ({ totalValue }) => {
    const [data, setData] = useState({ ingAnsk: '', tillkommande: '', reglerade: '', bortskrivna: '', ingNedskriv: '', aretsNedskriv: '' });
    const handle = (e, field) => setData({ ...data, [field]: e.target.value });
  
    const summa = ((Number(data.ingAnsk) || 0) + (Number(data.tillkommande) || 0) - (Number(data.reglerade) || 0) - (Number(data.bortskrivna) || 0)) - ((Number(data.ingNedskriv) || 0) + (Number(data.aretsNedskriv) || 0));
    const isValid = Math.round(summa) === Math.round(totalValue);
  
    return (
      <div className="p-4 bg-white rounded-lg ml-4 mt-2 border-l-4 border-blue-500 space-y-3">
        <div className="flex justify-between font-bold text-sm"><span>Andra långfristiga fordringar</span><span>{formatNumber(totalValue)}</span></div>
        <div className="font-semibold text-gray-800">Anskaffningsvärden</div>
        <NoteField label="Ingående anskaffningsvärden" value={data.ingAnsk} onChange={e => handle(e, 'ingAnsk')} />
        <NoteField label="Tillkommande fordringar" value={data.tillkommande} onChange={e => handle(e, 'tillkommande')} />
        <NoteField label="Reglerade fordringar" value={data.reglerade} onChange={e => handle(e, 'reglerade')} />
        <NoteField label="Bortskrivna fordringar" value={data.bortskrivna} onChange={e => handle(e, 'bortskrivna')} />
        <div className="font-semibold text-gray-800">Nedskrivningar</div>
        <NoteField label="Ingående nedskrivningar" value={data.ingNedskriv} onChange={e => handle(e, 'ingNedskriv')} />
        <NoteField label="Årets nedskrivningar" value={data.aretsNedskriv} onChange={e => handle(e, 'aretsNedskriv')} />
        <hr/>
        <div className="flex justify-between font-bold text-lg"><span>Bokfört värde</span><span>{formatNumber(summa)}</span></div>
        {!isValid && (
          <div className="flex items-center p-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
            <FiAlertCircle className="mr-2"/> Summan måste vara samma som redovisat värde i balansräkningen.
          </div>
        )}
      </div>
    );
};

const SkulderNote = ({ totalValue }) => {
    const [summa, setSumma] = useState('');
    const [kommentar, setKommentar] = useState('');

    return (
        <div className="p-4 bg-white rounded-lg ml-4 mt-2 border-l-4 border-blue-500 space-y-3">
            <div className="flex justify-between font-bold text-sm"><span>Långfristiga skulder</span><span>{formatNumber(totalValue)}</span></div>
            <NoteField label="Skulder som ska betalas senare än fem år" value={summa} onChange={e => setSumma(e.target.value)} />
            <div>
                <label className="text-sm text-gray-600">Kommentar</label>
                <textarea
                    value={kommentar}
                    onChange={e => setKommentar(e.target.value)}
                    rows={3}
                    className="mt-1 w-full px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
        </div>
    );
};

// --- Huvudkomponenten ---

const Step4_Noter: React.FC<Props> = ({ k2Results, onNext, onBack }) => {
  const [medelantalAnstallda, setMedelantalAnstallda] = useState('');
  const [avskrivningstid, setAvskrivningstid] = useState('5');
  const [kommentar, setKommentar] = useState('');
  
  const [showInventarier, setShowInventarier] = useState(true);
  const [showFordringar, setShowFordringar] = useState(true);
  const [showSkulder, setShowSkulder] = useState(true);

  // Hämta totalerna direkt från det färdigberäknade resultatet
  const inventarierTotal = k2Results.balance_sheet.fixed_assets_tangible.current;
  // Not: Antar att "Andra långfristiga fordringar" inte finns som separat post i k2Results än.
  // Vi sätter den till 0 för nu. Om den behövs måste den läggas till i kalkylatorn.
  const fordringarTotal = 0; 
  const skulderTotal = k2Results.balance_sheet.long_term_liabilities.current;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-800">Steg 4: Noter</h2>
        <p className="text-center text-gray-500 mt-2">Kompletterande upplysningar till årsredovisningen.</p>
      </div>

      <div className="space-y-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800">Redovisningsprinciper</h3>
        <div className="flex items-start bg-white p-4 rounded-lg shadow-sm">
          <FiInfo className="h-5 w-5 mr-3 text-blue-500 mt-1 flex-shrink-0" />
          <p className="text-gray-700">
            Årsredovisningen är upprättad i enlighet med årsredovisningslagen och BFNAR 2016:10 Årsredovisning i mindre företag (K2). Vi har fyllt i standardvärden för att göra det enkelt för dig.
          </p>
        </div>
        <div className="space-y-2">
            <label htmlFor="avskrivningstid" className="block text-sm font-medium text-gray-700">Avskrivningstid för inventarier, verktyg och installationer (Antal år)</label>
            <input
                type="number"
                id="avskrivningstid"
                value={avskrivningstid}
                onChange={(e) => setAvskrivningstid(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="t.ex. 5"
            />
        </div>
        <div className="space-y-2">
            <label htmlFor="kommentar" className="block text-sm font-medium text-gray-700">Kommentar (frivilligt)</label>
            <textarea
                id="kommentar"
                rows={3}
                value={kommentar}
                onChange={(e) => setKommentar(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Eventuella avvikelser eller förtydliganden..."
            />
        </div>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Medelantalet anställda</h3>
        <div className="space-y-2">
            <label htmlFor="medelantal" className="block text-sm font-medium text-gray-700">Ange medelantalet anställda under året</label>
            <input
                type="number"
                id="medelantal"
                value={medelantalAnstallda}
                onChange={(e) => setMedelantalAnstallda(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="t.ex. 2.5"
            />
             <p className="text-xs text-gray-500">Heltidstjänster räknas som 1. Två halvtidsanställda motsvarar en heltidstjänst. Kan även skrivas med decimal.</p>
        </div>
      </div>

      <div className="space-y-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Specifika noter</h3>
        <div className="space-y-3">
            <ToggleSwitch label="Inventarier, verktyg och installationer" enabled={showInventarier} setEnabled={setShowInventarier} />
            {showInventarier && <InventarierNote totalValue={inventarierTotal} />}
            
            <ToggleSwitch label="Andra långfristiga fordringar" enabled={showFordringar} setEnabled={setShowFordringar} />
            {showFordringar && <FordringarNote totalValue={fordringarTotal} />}

            <ToggleSwitch label="Långfristiga skulder" enabled={showSkulder} setEnabled={setShowSkulder} />
            {showSkulder && <SkulderNote totalValue={skulderTotal} />}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
          Tillbaka
        </button>
        <button onClick={onNext} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          Nästa
        </button>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg border border-gray-200">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input 
          type="checkbox" 
          name={label}
          id={label}
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:bg-blue-600"
        />
        <label htmlFor={label} className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
      </div>
    </div>
  );

export default Step4_Noter;
