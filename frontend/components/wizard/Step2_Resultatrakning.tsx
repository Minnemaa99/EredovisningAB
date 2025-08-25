// Step2_Resultatrakning.tsx
import React, { useState, useMemo } from 'react';

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
    // I SIE är intäkter negativa och kostnader positiva. Vi vänder på det för visning.
    const displayNum = num * -1;
    return Math.round(displayNum).toLocaleString('sv-SE');
};

// --- Huvudkomponenten ---

const Step2_Resultatrakning: React.FC<Props> = ({
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

    // --- RÖRELSEINTÄKTER ---
    const nettoomsattning = calculateRow(3000, 3799);
    const forandringLager = calculateRow(3960, 3969);
    const aktiveratArbete = calculateRow(3970, 3979);
    const ovrigaRorelseintakter = calculateRow(3800, 3999); // Exkl. 396x, 397x
    const totalaRorelseintakter = { current: nettoomsattning.current + forandringLager.current + aktiveratArbete.current + ovrigaRorelseintakter.current, previous: nettoomsattning.previous + forandringLager.previous + aktiveratArbete.previous + ovrigaRorelseintakter.previous };

    // --- RÖRELSEKOSTNADER ---
    const ravaror = calculateRow(4000, 4599);
    const handelsvaror = calculateRow(4600, 4999);
    const ovrigaExternaKostnader = calculateRow(5000, 6999);
    const personalkostnader = calculateRow(7000, 7699);
    const avskrivningar = calculateRow(7700, 7899);
    const nedskrivningarOmsattning = calculateRow(7960, 7969); // Exempelintervall
    const ovrigaRoresekostnader = calculateRow(7900, 7999); // Exkl. 796x
    const totalaRoresekostnader = { current: ravaror.current + handelsvaror.current + ovrigaExternaKostnader.current + personalkostnader.current + avskrivningar.current + nedskrivningarOmsattning.current + ovrigaRoresekostnader.current, previous: ravaror.previous + handelsvaror.previous + ovrigaExternaKostnader.previous + personalkostnader.previous + avskrivningar.previous + nedskrivningarOmsattning.previous + ovrigaRoresekostnader.previous };
    
    const rorelseresultat = { current: totalaRorelseintakter.current + totalaRoresekostnader.current, previous: totalaRorelseintakter.previous + totalaRoresekostnader.previous };

    // --- FINANSIELLA POSTER ---
    const finansiellaIntakter = calculateRow(8000, 8399);
    const finansiellaKostnader = calculateRow(8400, 8799);
    const totalaFinansiellaPoster = { current: finansiellaIntakter.current + finansiellaKostnader.current, previous: finansiellaIntakter.previous + finansiellaKostnader.previous };
    
    const resultatEfterFinans = { current: rorelseresultat.current + totalaFinansiellaPoster.current, previous: rorelseresultat.previous + totalaFinansiellaPoster.previous };

    // --- BOKSLUTSDISPOSITIONER & SKATT ---
    const bokslutsdispositioner = calculateRow(8800, 8899);
    const resultatForeSkatt = { current: resultatEfterFinans.current + bokslutsdispositioner.current, previous: resultatEfterFinans.previous + bokslutsdispositioner.previous };
    const skatt = calculateRow(8900, 8999);
    const aretsResultat = { current: resultatForeSkatt.current + skatt.current, previous: resultatForeSkatt.previous + skatt.previous };

    return [
      { label: 'Rörelseintäkter, lagerförändringar m.m.', type: 'main', values: totalaRorelseintakter, show: 'always' },
      { label: 'Nettoomsättning', type: 'sub', values: nettoomsattning, show: 'expanded' },
      { label: 'Förändring av lager av produkter i arbete...', type: 'sub', values: forandringLager, show: 'expanded' },
      { label: 'Aktiverat arbete för egen räkning', type: 'sub', values: aktiveratArbete, show: 'expanded' },
      { label: 'Övriga rörelseintäkter', type: 'sub', values: ovrigaRorelseintakter, show: 'expanded' },
      
      { label: 'Rörelsekostnader', type: 'main', values: totalaRoresekostnader, show: 'always' },
      { label: 'Råvaror och förnödenheter', type: 'sub', values: ravaror, show: 'expanded' },
      { label: 'Handelsvaror', type: 'sub', values: handelsvaror, show: 'expanded' },
      { label: 'Övriga externa kostnader', type: 'sub', values: ovrigaExternaKostnader, show: 'expanded' },
      { label: 'Personalkostnader', type: 'sub', values: personalkostnader, show: 'expanded' },
      { label: 'Av- och nedskrivningar av materiella och immateriella anl.tillg.', type: 'sub', values: avskrivningar, show: 'expanded' },
      { label: 'Nedskrivningar av omsättningstillgångar...', type: 'sub', values: nedskrivningarOmsattning, show: 'expanded' },
      { label: 'Övriga rörelsekostnader', type: 'sub', values: ovrigaRoresekostnader, show: 'expanded' },
      
      { label: 'Rörelseresultat', type: 'total', values: rorelseresultat, show: 'always' },
      
      { label: 'Finansiella poster', type: 'main', values: totalaFinansiellaPoster, show: 'always' },
      { label: 'Resultat från andelar i koncernföretag', type: 'sub', values: calculateRow(8010, 8019), show: 'expanded' },
      { label: 'Resultat från andelar i intresseföretag...', type: 'sub', values: calculateRow(8020, 8029), show: 'expanded' },
      { label: 'Resultat från övriga finansiella anl.tillg.', type: 'sub', values: calculateRow(8000, 8199), show: 'expanded' },
      { label: 'Övriga ränteintäkter och liknande resultatposter', type: 'sub', values: calculateRow(8300, 8399), show: 'expanded' },
      { label: 'Nedskrivningar av finansiella anl.tillg...', type: 'sub', values: calculateRow(8200, 8299), show: 'expanded' },
      { label: 'Räntekostnader och liknande resultatposter', type: 'sub', values: calculateRow(8400, 8499), show: 'expanded' },
      
      { label: 'Resultat efter finansiella poster', type: 'total', values: resultatEfterFinans, show: 'always' },
      
      { label: 'Bokslutsdispositioner', type: 'main', values: bokslutsdispositioner, show: 'always' },
      { label: 'Erhållna koncernbidrag', type: 'sub', values: calculateRow(8810, 8819), show: 'expanded' },
      { label: 'Lämnade koncernbidrag', type: 'sub', values: calculateRow(8820, 8829), show: 'expanded' },
      { label: 'Förändring av periodiseringsfonder', type: 'sub', values: calculateRow(8830, 8849), show: 'expanded' },
      { label: 'Förändring av överavskrivningar', type: 'sub', values: calculateRow(8850, 8859), show: 'expanded' },
      { label: 'Övriga bokslutsdispositioner', type: 'sub', values: calculateRow(8860, 8899), show: 'expanded' },

      { label: 'Resultat före skatt', type: 'total', values: resultatForeSkatt, show: 'always' },
      
      { label: 'Skatt på årets resultat', type: 'main', values: skatt, show: 'always' },
      { label: 'Övriga skatter', type: 'sub', values: calculateRow(8920, 8999), show: 'expanded' },

      { label: 'Årets resultat', type: 'grand-total', values: aretsResultat, show: 'always' },
    ];
  }, [accounts, prevAccounts]);

  const getRowStyle = (type: string) => {
    switch (type) {
      case 'main': return 'font-semibold text-gray-700';
      case 'sub': return 'pl-8 text-gray-600';
      case 'total': return 'font-bold bg-gray-50';
      case 'grand-total': return 'font-extrabold text-lg border-t-2 border-black';
      default: return '';
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Resultaträkning</h2>
      <p className="text-center text-gray-500 mb-6">En sammanställning av företagets intäkter och kostnader.</p>
      
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
            {reportData.map((row, index) => {
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

export default Step2_Resultatrakning;