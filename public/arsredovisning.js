// Deklarera globala objekt för att lagra data
let rakenskapsarData = {};
let resultatrakningData = {};
let balansrakningData = {};
let noterData = {};
let companyInfo = {};

// Funktion för att ladda sidor
function loadPage(page) {
    const mainContent = document.getElementById('main-content');

    switch(page) {
        case 'start':
            window.history.pushState({}, '', '/arsredovisning/ny/start');
            mainContent.innerHTML = `
                <h1>Fyll i Företagsinformation</h1>
                <form id="companyInfoForm">
                    <label for="orgNumber">Organisationsnummer:</label>
                    <input type="text" id="orgNumber" required>

                    <label for="companyName">Företagsnamn:</label>
                    <input type="text" id="companyName" required>

                    <label for="postNumber">Postnummer:</label>
                    <input type="text" id="postNumber" required>

                    <label for="postOrt">Postort:</label>
                    <input type="text" id="postOrt" required>

                    <button type="submit">Spara Företagsinformation</button>
                    <p id="confirmationMessage"></p>
                </form>`;

            document.getElementById('companyInfoForm').addEventListener('submit', function(event) {
                event.preventDefault();
                const orgNumber = document.getElementById('orgNumber').value;
                const companyName = document.getElementById('companyName').value;
                const postNumber = document.getElementById('postNumber').value;
                const postOrt = document.getElementById('postOrt').value;

                // Uppdatera den globala companyInfo variabeln istället för att skapa en lokal variabel
                companyInfo = { orgNumber, companyName, postNumber, postOrt };
                console.log('Företagsinformation sparad:', companyInfo);
                document.getElementById('confirmationMessage').innerText = 'Företagsinformation sparad!';

                // Gå vidare till nästa del
                loadPage('rakenskapsar');
            });
        break;


        case 'rakenskapsar':
            window.history.pushState({}, '', '/arsredovisning/ny/rakenskapsar');
            mainContent.innerHTML = `
                <h1>Räkenskapsår</h1>
                <form id="rakenskapsarForm">
                    <div>
                        <label for="startAr">Räkenskapsårets början:</label>
                        <input type="date" id="startAr" required>
                    </div>
                    <div>
                        <label for="slutAr">Räkenskapsårets slut:</label>
                        <input type="date" id="slutAr" required>
                    </div>
                    <button type="submit">Spara och gå vidare</button>
                    <p id="confirmationMessage"></p>
                </form>`;

            document.getElementById('rakenskapsarForm').addEventListener('submit', function(event) {
                event.preventDefault();
                const startAr = document.getElementById('startAr').value;
                const slutAr = document.getElementById('slutAr').value;

                rakenskapsarData = { startAr, slutAr };
                document.getElementById('confirmationMessage').innerText = `Räkenskapsår sparat: ${startAr} - ${slutAr}`;
                console.log('Sparade data:', rakenskapsarData);

                // Gå vidare till nästa del
                loadPage('resultatrakning');
            });
            break;


        case 'resultatrakning':
                window.history.pushState({}, '', '/arsredovisning/ny/resultatrakning');
                mainContent.innerHTML = `
                    <h1>Resultaträkning</h1>
                    <form id="resultatrakningForm">
                        <h2>Period: 2023-01-01 - 2023-12-31</h2>

                        <h3>Rörelseintäkter, lagerförändringar m.m.</h3>
                        <label for="nettoomsättning">Nettoomsättning:</label>
                        <input type="number" id="nettoomsättning" required>

                        <label for="forandring_lager">Förändring av lager:</label>
                        <input type="number" id="forandring_lager" required>

                        <label for="ovriga_intakter">Övriga rörelseintäkter:</label>
                        <input type="number" id="ovriga_intakter" required>

                        <h3>Rörelsekostnader</h3>
                        <label for="ravaror">Råvaror och förnödenheter:</label>
                        <input type="number" id="ravaror" required>

                        <label for="handelsvaror">Handelsvaror:</label>
                        <input type="number" id="handelsvaror" required>

                        <label for="externa_kostnader">Övriga externa kostnader:</label>
                        <input type="number" id="externa_kostnader" required>

                        <label for="personalkostnader">Personalkostnader:</label>
                        <input type="number" id="personalkostnader" required>

                        <label for="avskrivningar">Av- och nedskrivningar:</label>
                        <input type="number" id="avskrivningar" required>

                        <label for="ovriga_kostnader">Övriga rörelsekostnader:</label>
                        <input type="number" id="ovriga_kostnader" required>

                        <h3>Finansiella poster</h3>
                        <label for="ovriga_ranteintakter">Övriga ränteintäkter:</label>
                        <input type="number" id="ovriga_ranteintakter" required>

                        <label for="rantekostnader">Räntekostnader:</label>
                        <input type="number" id="rantekostnader" required>

                        <h3>Bokslutsdispositioner</h3>
                        <label for="periodiseringsfonder">Förändring av periodiseringsfonder:</label>
                        <input type="number" id="periodiseringsfonder" required>

                        <label for="overavskrivningar">Förändring av överavskrivningar:</label>
                        <input type="number" id="overavskrivningar" required>

                        <label for="ovriga_dispositioner">Övriga bokslutsdispositioner:</label>
                        <input type="number" id="ovriga_dispositioner" required>

                        <h3>Resultat</h3>
                        <label for="skatt_resultat">Skatt på årets resultat:</label>
                        <input type="number" id="skatt_resultat" required>

                        <button type="submit">Spara och gå vidare</button>
                        <p id="result"></p>
                    </form>`;

                const resultatrakningForm = document.getElementById('resultatrakningForm');
                resultatrakningForm.addEventListener('submit', function (event) {
                    event.preventDefault();
                    submitResultatrakningForm();
                });

                function submitResultatrakningForm() {
                    // Läs in data från formuläret
                    const data = {
                        nettoomsättning: parseFloat(document.getElementById('nettoomsättning').value) || 0,
                        forandring_lager: parseFloat(document.getElementById('forandring_lager').value) || 0,
                        ovriga_intakter: parseFloat(document.getElementById('ovriga_intakter').value) || 0,
                        ravaror: parseFloat(document.getElementById('ravaror').value) || 0,
                        handelsvaror: parseFloat(document.getElementById('handelsvaror').value) || 0,
                        externa_kostnader: parseFloat(document.getElementById('externa_kostnader').value) || 0,
                        personalkostnader: parseFloat(document.getElementById('personalkostnader').value) || 0,
                        avskrivningar: parseFloat(document.getElementById('avskrivningar').value) || 0,
                        ovriga_kostnader: parseFloat(document.getElementById('ovriga_kostnader').value) || 0,
                        ovriga_ranteintakter: parseFloat(document.getElementById('ovriga_ranteintakter').value) || 0,
                        rantekostnader: parseFloat(document.getElementById('rantekostnader').value) || 0,
                        periodiseringsfonder: parseFloat(document.getElementById('periodiseringsfonder').value) || 0,
                        overavskrivningar: parseFloat(document.getElementById('overavskrivningar').value) || 0,
                        ovriga_dispositioner: parseFloat(document.getElementById('ovriga_dispositioner').value) || 0,
                        skatt_resultat: parseFloat(document.getElementById('skatt_resultat').value) || 0,
                    };

                    // Beräkningar
                    const rörelseresultat = data.nettoomsättning + data.forandring_lager + data.ovriga_intakter -
                        (data.ravaror + data.handelsvaror + data.externa_kostnader +
                            data.personalkostnader + data.avskrivningar + data.ovriga_kostnader);

                    const resultat_efter_finansiella_poster = rörelseresultat + data.ovriga_ranteintakter - data.rantekostnader;
                    const resultat_fore_skatt = resultat_efter_finansiella_poster - (data.periodiseringsfonder + data.overavskrivningar + data.ovriga_dispositioner);
                    const årets_resultat = resultat_fore_skatt - data.skatt_resultat;

                    // Spara beräknade data i en variabel
                    const resultatrakningData = { ...data, rörelseresultat, resultat_efter_finansiella_poster, resultat_fore_skatt, årets_resultat };

                    console.log('Sparade data för resultaträkning:', resultatrakningData);

                    // Visa meddelande
                    document.getElementById('result').innerText = 'Resultaträkning sparad! Rörelseresultat: ' + rörelseresultat + ', Årets resultat: ' + årets_resultat;

                    // Gå vidare till nästa del
                    loadPage('balansrakning');
                }
                break;



        case 'balansrakning':
            window.history.pushState({}, '', '/arsredovisning/ny/balansrakning');
            mainContent.innerHTML = `
                <h1>Balansräkning</h1>
                <form id="balansrakningForm">
                    <label for="tillgangar">Tillgångar:</label>
                    <input type="number" id="tillgangar" required>

                    <label for="skulder">Skulder:</label>
                    <input type="number" id="skulder" required>

                    <button type="submit">Spara och gå vidare</button>
                    <p id="balansResult"></p>
                </form>`;

            const balansrakningForm = document.getElementById('balansrakningForm');
            balansrakningForm.addEventListener('submit', function(event) {
                event.preventDefault();
                submitBalansrakningForm();
            });

            function submitBalansrakningForm() {
                const tillgangar = document.getElementById('tillgangar').value;
                const skulder = document.getElementById('skulder').value;

                balansrakningData = { tillgangar, skulder };
                console.log('Sparade data för balansräkning:', balansrakningData);

                document.getElementById('balansResult').innerText = 'Balansräkning sparad!';

                // Gå vidare till nästa del
                loadPage('noter');
            }
            break;

        case 'noter':
            window.history.pushState({}, '', '/arsredovisning/ny/noter');
            mainContent.innerHTML = `
                <h1>Noter</h1>
                <form id="noterForm">
                    <label for="note">Lägg till en not:</label>
                    <textarea id="note" required></textarea>

                    <button type="submit">Spara och gå vidare</button>
                    <p id="notResult"></p>
                </form>`;

            const noterForm = document.getElementById('noterForm');
            noterForm.addEventListener('submit', function(event) {
                event.preventDefault();
                submitNoterForm();
            });

            function submitNoterForm() {
                const note = document.getElementById('note').value;
                noterData = { note };
                console.log('Sparade data för noter:', noterData);

                document.getElementById('notResult').innerText = 'Noter sparade!';

                // Gå vidare till slutför årsredovisningen
                loadPage('slutförarsredovisningen');
            }
            break;

        case 'slutförarsredovisningen':
            window.history.pushState({}, '', '/arsredovisning/ny/slutfor');
            mainContent.innerHTML = `
                <h1>Slutför Årsredovisningen</h1>
                <p>Här är en sammanfattning av din årsredovisning:</p>


                <button id="generatePdf">Skapa årsredovisning (PDF)</button>

            `;

            document.getElementById('generatePdf').addEventListener('click', function() {
                generatePdf();
            });

            break;
    }
}

    function generatePdf(resultatrakningData) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Förstasidan
        pdf.setFontSize(15);
        const mainTitle = 'Årsredovisning'; // Ändrat namn från title till mainTitle
        const titleWidth = pdf.getStringUnitWidth(mainTitle) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(mainTitle, (pdf.internal.pageSize.getWidth() - titleWidth) / 2, 20); // Centrera titeln

        pdf.setFontSize(10);
        const forText = 'för';
        const forWidth = pdf.getStringUnitWidth(forText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(forText, (pdf.internal.pageSize.getWidth() - forWidth) / 2, 40); // Centrera "för"

        pdf.setFontSize(15);
        const companyName = companyInfo.companyName || '';
        const companyNameWidth = pdf.getStringUnitWidth(companyName) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(companyName, (pdf.internal.pageSize.getWidth() - companyNameWidth) / 2, 60); // Centrera företagsnamnet

        pdf.setFontSize(18);
        const orgNumber = companyInfo.orgNumber || '';
        const orgNumberWidth = pdf.getStringUnitWidth(orgNumber) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(orgNumber, (pdf.internal.pageSize.getWidth() - orgNumberWidth) / 2, 80); // Centrera organisationsnummer

        const postOrtText = `Postort: ${companyInfo.postOrt || ''}`;
        const postOrtWidth = pdf.getStringUnitWidth(postOrtText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(postOrtText, (pdf.internal.pageSize.getWidth() - postOrtWidth) / 2, 100); // Centrera postort

        const postNumberText = `Postnummer: ${companyInfo.postNumber || ''}`;
        const postNumberWidth = pdf.getStringUnitWidth(postNumberText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(postNumberText, (pdf.internal.pageSize.getWidth() - postNumberWidth) / 2, 120); // Centrera postnummer

        const currentDate = `Datum: ${new Date().toLocaleDateString()}`;
        const currentDateWidth = pdf.getStringUnitWidth(currentDate) * pdf.internal.getFontSize() / pdf.internal.scaleFactor; // Beräkna bredden på texten
        pdf.text(currentDate, (pdf.internal.pageSize.getWidth() - currentDateWidth) / 2, 140); // Centrera datum

        // Ställ in teckenstorlek för rubriken
        pdf.setFontSize(20);
        const räkenskapsårTitle = 'Räkenskapsåret:'; // Ändrat namn till räkenskapsårTitle
        const titleWidth2 = pdf.getTextWidth(räkenskapsårTitle); // Beräkna textens bredd
        const xTitle = (pdf.internal.pageSize.getWidth() - titleWidth2) / 2; // Beräkna x-koordinaten för centrering
        pdf.text(räkenskapsårTitle, xTitle, 160); // Använd den beräknade x-koordinaten

        // Ställ in teckenstorlek för datumet
        pdf.setFontSize(16);
        const dateRange = `${rakenskapsarData.startAr || ''} - ${rakenskapsarData.slutAr || ''}`; // Räkenskapsår
        const dateWidth = pdf.getTextWidth(dateRange); // Beräkna textens bredd
        const xDate = (pdf.internal.pageSize.getWidth() - dateWidth) / 2; // Beräkna x-koordinaten för centrering
        pdf.text(dateRange, xDate, 180); // Använd den beräknade x-koordinaten

        // Ny sida för resterande data
        //Resultaträkningens
        pdf.addPage(); // Lägg till en ny sida för Förvaltningsberättelse

        // Rubrik för Förvaltningsberättelsen
        pdf.setFontSize(16);
        pdf.text('Förvaltningsberättelse', 10, 10);

        // Sektion: Verksamheten
        let startY = 20;
        pdf.setFontSize(14);
        pdf.text('Verksamheten', 10, startY);
        pdf.setFontSize(12);
        startY += 10;
        pdf.text('Allmänt om verksamheten:', 10, startY);
        startY += 10;
        pdf.text(
          'Företaget bedriver verksamhet inom bokföring, rådgivning och andra ekonomiska tjänster. Här är en översikt av verksamhetsåret 2023.',
          10,
          startY,
          { maxWidth: 180 } // Begränsar textens bredd för att skapa en snyggare layout
        );

        // Flerårsöversikt
        startY += 30;
        pdf.setFontSize(14);
        pdf.text('Flerårsöversikt (tkr)', 10, startY);
        pdf.setFontSize(12);
        startY += 10;

        // Lägg till tabell eller lista för Flerårsöversikt
        pdf.text('År', 10, startY);
        pdf.text(`Nettoomsättning`, 60, startY);
        pdf.text('Resultat efter finansiella poster', 140, startY);

        startY += 10;
        pdf.text('2023', 10, startY);



        // Avslutande kommentar
        startY += 20;
        pdf.text(
          'Denna flerårsöversikt ger en sammanfattning av företagets finansiella utveckling och är baserad på tillgängliga uppgifter.',
          10,
          startY,
          { maxWidth: 180 }
        );

        // Lägg till ytterligare sektioner vid behov

        // Skapa PDF-filen
        pdf.save('Resultatrakning_och_Forvaltningsberattelse.pdf');

        // Öppna PDF-filen i en ny flik
        pdf.output('dataurlnewwindow');
    }
