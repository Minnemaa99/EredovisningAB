function processFilesru() {
    const fileInput = document.getElementById('sie-file-sru');
    const file = fileInput.files[0];

    if (!file) {
        alert("Vänligen ladda upp en SIE-fil.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const fileContent = event.target.result;

        // Parsar SIE-filen och genererar SRU
        try {
            const sieData = parseSIE(fileContent);
            const sruFiles = generateSRU(sieData);

            // Ge användaren möjlighet att ladda ner SRU-filer
            downloadFile('INFO.sru', sruFiles.info);
            downloadFile('BLANKETTER.sru', sruFiles.blanketter);

            alert("SRU-filer genererade!");
        } catch (error) {
            console.error("Fel vid bearbetning:", error);
            alert("Ett fel uppstod vid bearbetning av SIE-filen.");
        }
    };

    reader.onerror = function () {
        alert("Fel vid läsning av filen.");
    };

    reader.readAsText(file); // Läs filen som text
}

// Parsar innehållet i SIE-filen och extraherar relevant data
function parseSIE(content) {
    const lines = content.split('\n');
    const companyInfo = parseCompanyInfo(lines);
    const periods = parsePeriods(lines);
    const balances = parseBalances(lines);

    return {
        companyInfo,
        startDate: periods.startDate,
        endDate: periods.endDate,
        balances,
    };
}

// Extrahera företagsinformation från SIE-filen
function parseCompanyInfo(lines) {
    const nameLine = lines.find(line => line.startsWith('#FNAMN'));
    const orgNrLine = lines.find(line => line.startsWith('#ORGNR'));

    if (!nameLine || !orgNrLine) {
        throw new Error("Företagsinformation saknas i SIE-filen.");
    }

    return {
        name: nameLine.split(' ').slice(1).join(' ').trim(),
        orgNr: orgNrLine.split(' ')[1].trim(),
    };
}

// Extrahera periodinformation (#RAR)
function parsePeriods(lines) {
    const periodLine = lines.find(line => line.startsWith('#RAR'));
    if (!periodLine) {
        throw new Error("Periodinformation saknas i SIE-filen.");
    }

    const parts = periodLine.split(' ');
    return {
        startDate: parts[1],
        endDate: parts[2],
    };
}

// Extrahera balansinformation (#UB och #RES)
function parseBalances(lines) {
    return lines
        .filter(line => line.startsWith('#UB') || line.startsWith('#RES'))
        .map(line => {
            const parts = line.split(' ');
            return {
                account: parts[2],
                balance: parseFloat(parts[3]),
            };
        });
}

// Generera SRU-filer baserat på extraherad data
function generateSRU(sieData) {
    const { companyInfo, startDate, endDate, balances } = sieData;

    const infoSRU = generateInfoSRU(companyInfo);
    const blanketterSRU = generateBlanketterSRU(companyInfo, startDate, endDate, balances);

    return { info: infoSRU, blanketter: blanketterSRU };
}

// Skapa innehåll för INFO.sru
function generateInfoSRU(companyInfo) {
    return `
#DATABESKRIVNING_START
#PRODUKT SRU
#SKAPAD ${getCurrentDate()} ${getCurrentTime()}
#PROGRAM SIEtoSRU
#FILNAMN BLANKETTER.SRU
#DATABESKRIVNING_SLUT
#MEDIELEV_START
#ORGNR 16${companyInfo.orgNr}
#NAMN ${companyInfo.name}
#POSTNR 12345
#POSTORT DinPostort
#MEDIELEV_SLUT
    `.trim();
}

// Skapa innehåll för BLANKETTER.sru
function generateBlanketterSRU(companyInfo, startDate, endDate, balances) {
    const header = `
#BLANKETT INK2-2023P4
#IDENTITET 16${companyInfo.orgNr} ${getCurrentDate()} ${getCurrentTime()}
#NAMN ${companyInfo.name}
#SYSTEMINFO Skapad av SIEtoSRU
#UPPGIFT 7011 ${startDate}
#UPPGIFT 7012 ${endDate}
    `.trim();

    const balanceLines = balances
        .map(balance => `#UPPGIFT ${balance.account} ${balance.balance.toFixed(2)}`)
        .join('\n');

    return `${header}\n${balanceLines}\n#BLANKETTSLUT\n#FIL_SLUT`;
}

// Hjälpfunktion för att ladda ner filer
function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Hjälpfunktion för att få dagens datum
function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0].replace(/-/g, '');
}

// Hjälpfunktion för att få aktuell tid
function getCurrentTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0].replace(/:/g, '');
}
