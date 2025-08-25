import React, { useState, useMemo } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

// --- Typer och hjälpfunktioner ---

export interface Account {
  account_number: string;
  account_name: string;
  balance: number;
}

interface Props {
  accounts: Account[];
  prevAccounts: Account[];
  onNext: () => void;
  onBack: () => void;
}

const calculateSum = (accountList: Account[], start: number, end: number): number => {
  if (!accountList) return 0;
  return accountList
    .filter(a => {
      const accNum = parseInt(a.account_number);
      return accNum >= start && accNum <= end;
    })
    .reduce((sum, acc) => sum + acc.balance, 0);
};

const formatNumber = (num: number) => {
    if (num === 0) return '0';
    return Math.round(num).toLocaleString('sv-SE');
};

// --- Huvudkomponenten ---

const Step3_Balansrakning: React.FC<Props> = ({
  accounts = [],
  prevAccounts = [],
  onNext,
  onBack,
}) => {
  const [showAllPosts, setShowAllPosts] = useState(false);

  const reportData = useMemo(() => {
    const calculateRow = (start: number, end: number) => ({
      current: calculateSum(accounts, start, end),
      previous: calculateSum(prevAccounts, start, end),
    });

    // --- TILLGÅNGAR ---
    const anlaggningstillgangar = calculateRow(1000, 1399);
    const materiellaAnl = calculateRow(1100, 1299);
    const finansiellaAnl = calculateRow(1300, 1399);
    const omsattningstillgangar = calculateRow(1400, 1999);
    const varulager = calculateRow(1400, 1499);
    const kortfristigaFordringar = calculateRow(1500, 1799);
    const kassaBank = calculateRow(1900, 1999);
    const summaTillgangar = { current: anlaggningstillgangar.current + omsattningstillgangar.current, previous: anlaggningstillgangar.previous + omsattningstillgangar.previous };

    // --- EGET KAPITAL OCH SKULDER ---
    const egetKapital = calculateRow(2000, 2099);
    const bundetEK = calculateRow(2080, 2089);
    const frittEK = calculateRow(2090, 2099);
    const obeskattadeReserver = calculateRow(2100, 2199);
    const avsattningar = calculateRow(2200, 2299);
    const langsiktigaSkulder = calculateRow(2300, 2399);
    const kortfristigaSkulder = calculateRow(2400, 2999);
    const summaEKochSkulder = { current: egetKapital.current + obeskattadeReserver.current + avsattningar.current + langsiktigaSkulder.current + kortfristigaSkulder.current, previous: egetKapital.previous + obeskattadeReserver.previous + avsattningar.previous + langsiktigaSkulder.previous + kortfristigaSkulder.previous };
    
    const balanceCheck = { current: Math.round(summaTillgangar.current - summaEKochSkulder.current), previous: Math.round(summaTillgangar.previous - summaEKochSkulder.previous) };

    return {
      rows: [
        { label: 'TILLGÅNGAR', type: 'header' },
        { label: 'Anläggningstillgångar', type: 'main', values: anlaggningstillgangar, show: 'always' },
        { label: 'Materiella anläggningstillgångar', type: 'sub', values: materiellaAnl, show: 'expanded' },
        { label: 'Byggnader och mark', type: 'sub-sub', values: calculateRow(1100, 1129), show: 'expanded' },
        { label: 'Maskiner och andra tekniska anläggningar', type: 'sub-sub', values: calculateRow(1200, 1219), show: 'expanded' },
        { label: 'Inventarier, verktyg och installationer', type: 'sub-sub', values: calculateRow(1220, 1229), show: 'expanded' },
        { label: 'Finansiella anläggningstillgångar', type: 'sub', values: finansiellaAnl, show: 'expanded' },
        { label: 'Andelar i koncernföretag', type: 'sub-sub', values: calculateRow(1310, 1319), show: 'expanded' },
        { label: 'Lån till delägare eller närstående', type: 'sub-sub', values: calculateRow(1383, 1383), show: 'expanded' },
        { label: 'Andra långfristiga fordringar', type: 'sub-sub', values: calculateRow(1300, 1389), show: 'expanded' },
        
        { label: 'Omsättningstillgångar', type: 'main', values: omsattningstillgangar, show: 'always' },
        { label: 'Varulager m.m.', type: 'sub', values: varulager, show: 'expanded' },
        { label: 'Råvaror och förnödenheter', type: 'sub-sub', values: calculateRow(1410, 1419), show: 'expanded' },
        { label: 'Varor under tillverkning', type: 'sub-sub', values: calculateRow(1420, 1439), show: 'expanded' },
        { label: 'Färdiga varor och handelsvaror', type: 'sub-sub', values: calculateRow(1440, 1459), show: 'expanded' },
        { label: 'Pågående arbete för annans räkning', type: 'sub-sub', values: calculateRow(1470, 1479), show: 'expanded' },
        { label: 'Förskott till leverantörer', type: 'sub-sub', values: calculateRow(1480, 1489), show: 'expanded' },
        { label: 'Kortfristiga fordringar', type: 'sub', values: kortfristigaFordringar, show: 'expanded' },
        { label: 'Kundfordringar', type: 'sub-sub', values: calculateRow(1510, 1519), show: 'expanded' },
        { label: 'Fordringar hos koncernföretag', type: 'sub-sub', values: calculateRow(1530, 1539), show: 'expanded' },
        { label: 'Övriga fordringar', type: 'sub-sub', values: calculateRow(1600, 1699), show: 'expanded' },
        { label: 'Förutbetalda kostnader och upplupna intäkter', type: 'sub-sub', values: calculateRow(1700, 1799), show: 'expanded' },
        { label: 'Kassa och bank', type: 'sub', values: kassaBank, show: 'expanded' },
        { label: 'Kassa och bank', type: 'sub-sub', values: calculateRow(1900, 1999), show: 'expanded' },
        { label: 'SUMMA TILLGÅNGAR', type: 'grand-total', values: summaTillgangar, show: 'always' },
        
        { label: 'EGET KAPITAL OCH SKULDER', type: 'header' },
        { label: 'Eget kapital', type: 'main', values: egetKapital, show: 'always' },
        { label: 'Bundet eget kapital', type: 'sub', values: bundetEK, show: 'expanded' },
        { label: 'Aktiekapital', type: 'sub-sub', values: calculateRow(2081, 2081), show: 'expanded' },
        { label: 'Reservfond', type: 'sub-sub', values: calculateRow(2085, 2085), show: 'expanded' },
        { label: 'Fritt eget kapital', type: 'sub', values: frittEK, show: 'expanded' },
        { label: 'Balanserat resultat', type: 'sub-sub', values: calculateRow(2091, 2098), show: 'expanded' },
        { label: 'Årets resultat', type: 'sub-sub', values: calculateRow(2099, 2099), show: 'expanded' },
        
        { label: 'Obeskattade reserver', type: 'main', values: obeskattadeReserver, show: 'always' },
        { label: 'Periodiseringsfonder', type: 'sub', values: calculateRow(2110, 2149), show: 'expanded' },
        { label: 'Ackumulerade överavskrivningar', type: 'sub', values: calculateRow(2150, 2159), show: 'expanded' },
        
        { label: 'Avsättningar', type: 'main', values: avsattningar, show: 'always' },
        { label: 'Avsättningar för pensioner', type: 'sub', values: calculateRow(2210, 2239), show: 'expanded' },
        { label: 'Övriga avsättningar', type: 'sub', values: calculateRow(2240, 2299), show: 'expanded' },
        
        { label: 'Långfristiga skulder', type: 'main', values: langsiktigaSkulder, show: 'always' },
        { label: 'Checkräkningskredit', type: 'sub', values: calculateRow(2330, 2339), show: 'expanded' },
        { label: 'Skulder till kreditinstitut', type: 'sub', values: calculateRow(2350, 2359), show: 'expanded' },
        { label: 'Övriga skulder', type: 'sub', values: calculateRow(2390, 2399), show: 'expanded' },
        
        { label: 'Kortfristiga skulder', type: 'main', values: kortfristigaSkulder, show: 'always' },
        { label: 'Leverantörsskulder', type: 'sub', values: calculateRow(2440, 2449), show: 'expanded' },
        { label: 'Skulder till koncernföretag', type: 'sub', values: calculateRow(2460, 2469), show: 'expanded' },
        { label: 'Skatteskulder', type: 'sub', values: calculateRow(2510, 2519), show: 'expanded' },
        { label: 'Övriga skulder', type: 'sub', values: calculateRow(2600, 2899), show: 'expanded' },
        { label: 'Upplupna kostnader och förutbetalda intäkter', type: 'sub', values: calculateRow(2900, 2999), show: 'expanded' },
        { label: 'SUMMA EGET KAPITAL OCH SKULDER', type: 'grand-total', values: summaEKochSkulder, show: 'always' },
      ],
      balanceCheck,
    };
  }, [accounts, prevAccounts]);

  const getRowStyle = (type: string) => {
    switch (type) {
      case 'header': return 'font-bold text-lg pt-6 text-gray-800';
      case 'main': return 'font-semibold text-gray-700';
      case 'sub': return 'pl-8 text-gray-600';
      case 'sub-sub': return 'pl-16 text-gray-500';
      case 'grand-total': return 'font-extrabold text-lg border-t-2 border-b-4 border-black bg-gray-50';
      default: return '';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Balansräkning</h2>
      <p className="text-center text-gray-500 mb-6">En ögonblicksbild av företagets finansiella ställning.</p>
      
      <div className="flex justify-between items-center mb-4 p-2 rounded-lg bg-gray-50">
        <div className="flex items-center">
          <label htmlFor="showAllPostsToggle" className="mr-3 text-sm font-medium text-gray-700">Visa alla poster</label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input 
              type="checkbox" 
              name="showAllPostsToggle" 
              id="showAllPostsToggle" 
              checked={showAllPosts}
              onChange={() => setShowAllPosts(!showAllPosts)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:bg-blue-600"
            />
            <label htmlFor="showAllPostsToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
            <div>Aktuellt år</div>
            <div>Föregående år</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beskrivning</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SEK</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SEK</th>
            </tr>
          </thead>
          <tbody>
            {reportData.rows.map((row, index) => {
              // Dölj raden om den är en detaljrad OCH "Visa alla poster" är avstängd
              if (row.show === 'expanded' && !showAllPosts) return null;

              return (
                <tr key={index} className={`${getRowStyle(row.type)} border-b border-gray-100 last:border-b-0`}>
                  <td className="px-2 py-3 whitespace-nowrap">{row.label}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-right font-mono">{row.values ? formatNumber(row.values.current) : ''}</td>
                  <td className="px-2 py-3 whitespace-nowrap text-right font-mono text-gray-500">{row.values ? formatNumber(row.values.previous) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reportData.balanceCheck.current !== 0 && (
         <div className="mt-6 flex items-center bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded-r-lg" role="alert">
          <FiAlertTriangle className="h-6 w-6 mr-3" />
          <div>
            <p className="font-bold">Balanskontroll misslyckades!</p>
            <p className="text-sm">Tillgångar och skulder balanserar inte för aktuellt år. Differens: {formatNumber(reportData.balanceCheck.current)} kr.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200">
          Tillbaka
        </button>
        <button onClick={onNext} className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
          Spara & Gå vidare
        </button>
      </div>
    </div>
  );
};

export default Step3_Balansrakning;
