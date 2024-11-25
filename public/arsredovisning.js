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
                    <label for="intakter">Intäkter:</label>
                    <input type="number" id="intakter" required>

                    <label for="kostnader">Kostnader:</label>
                    <input type="number" id="kostnader" required>

                    <button type="submit">Spara och gå vidare</button>
                    <p id="result"></p>
                </form>`;

            const resultatrakningForm = document.getElementById('resultatrakningForm');
            resultatrakningForm.addEventListener('submit', function(event) {
                event.preventDefault();
                submitResultatrakningForm();
            });

            function submitResultatrakningForm() {
                const intakter = document.getElementById('intakter').value;
                const kostnader = document.getElementById('kostnader').value;
                const resultat = intakter - kostnader;

                resultatrakningData = { intakter, kostnader, resultat };
                console.log('Sparade data för resultaträkning:', resultatrakningData);

                document.getElementById('result').innerText = 'Resultaträkning sparad!';

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

    function generatePdf() {
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
        pdf.addPage();

        // Lägg till övrig data i PDF-filen
        pdf.setFontSize(12);
        pdf.text('Detaljer:', 10, 10);
        pdf.text(`Intäkter: ${resultatrakningData.intakter || ''}`, 10, 20);
        pdf.text(`Kostnader: ${resultatrakningData.kostnader || ''}`, 10, 30);
        pdf.text(`Resultat: ${resultatrakningData.resultat || ''}`, 10, 40);
        pdf.text(`Tillgångar: ${balansrakningData.tillgangar || ''}`, 10, 50);
        pdf.text(`Skulder: ${balansrakningData.skulder || ''}`, 10, 60);
        pdf.text(`Noter: ${noterData.note || ''}`, 10, 70);

        // Öppna PDF-filen i en ny flik
        pdf.output('dataurlnewwindow');
    }

        
        

