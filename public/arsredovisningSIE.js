function processFile() {
  const fileInput = document.getElementById('sie-file-pdf');
  const file = fileInput.files[0];

  if (!file) {
      alert("Vänligen ladda upp en SIE/SE-fil.");
      return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
      const fileContent = event.target.result;

      // Läs och parsa SIE-filen
      const accountEntries = extractAccountEntries(fileContent);
      const companyName = extractCompanyName(fileContent) || "Företagsnamn saknas";

      // Ladda JSON-data (kontoplan)
      fetch('kontoplan.json')
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Kunde inte läsa kontoplan.json: ${response.statusText}`);
              }
              return response.json();
          })
          .then(accountData => {
              // Matcha kontonummer med titlar och belopp, och generera PDF
              generatePDF(accountEntries, accountData, companyName);
          })
          .catch(error => {
              console.error("Kunde inte läsa kontoplan.json:", error);
          });
  };

  reader.onerror = function () {
      alert("Fel vid läsning av filen.");
  };

  reader.readAsText(file); // Läser filen som text
}

function extractAccountEntries(content) {
  const lines = content.split('\n');
  const accountEntries = [];

  lines.forEach(line => {
      const parts = line.trim().split(' ');

      // Kontrollera om raden representerar en ingående balans (#IB)
      if (parts[0] === '#IB') {
          if (parts.length < 4 || isNaN(parseFloat(parts[3]))) {
              console.warn("Ogiltig #IB-rad ignorerad:", line);
              return;
          }
          const accountNumber = parts[2]; // Kontonummer (andra delen)
          const amount = parseFloat(parts[3]); // Belopp (tredje delen)
          accountEntries.push({ accountNumber, amount });
      }
  });

  return accountEntries;
}

function extractCompanyName(content) {
  const lines = content.split('\n');
  let companyName = '';

  lines.forEach(line => {
      const parts = line.trim().split(' ');

      // Kontrollera om raden representerar företagets namn (#FNAMN)
      if (parts[0] === '#FNAMN') {
          companyName = parts.slice(1).join(' '); // Få företagets namn som text
      }
  });

  return companyName;
}

function generatePDF(accountEntries, accountData, companyName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(30);
  doc.text("Årsredovisning", 105, 60, null, null, 'center');
  doc.setFontSize(24);
  doc.text(companyName, 105, 100, null, null, 'center');

  doc.addPage();

  doc.setFontSize(16);
  doc.text("Kontonummer, Titlar och Belopp", 10, 10);

  let yPos = 20;

  accountEntries.forEach(entry => {
      const accountTitle = accountData[entry.accountNumber]?.name || "Titel ej hittad";

      doc.setFontSize(12);
      doc.text(`Konto: ${entry.accountNumber} - Titel: ${accountTitle} - Belopp: ${entry.amount.toFixed(2)}`, 10, yPos);
      yPos += 10;

      if (yPos > 270) {
          doc.addPage();
          yPos = 20;
      }
  });

  doc.save('kontonummer_titlar_belopp.pdf');
}
