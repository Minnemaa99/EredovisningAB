
/* function loadPage(page) {
    const mainContent = document.getElementById('main-content');
    fetch(page)
        .then(response => response.text())
        .then(data => {
            mainContent.innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading page:', error);
            mainContent.innerHTML = '<p>Det gick inte att ladda sidan.</p>';
        });
}


document.getElementById('arsredovisningForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const rakenskapsar = document.getElementById('rakenskapsar').value;
    const intakter = document.getElementById('intakter').value;
    const kostnader = document.getElementById('kostnader').value;
    const resultat = intakter - kostnader;

    const data = {
        rakenskapsar,
        intakter,
        kostnader,
        resultat
    };

    // Skapa en PDF med jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Lägg till text i PDF-filen
    pdf.text(`Årsredovisning för räkenskapsår: ${rakenskapsar}`, 10, 10);
    pdf.text(`Intäkter: ${intakter}`, 10, 20);
    pdf.text(`Kostnader: ${kostnader}`, 10, 30);
    pdf.text(`Resultat: ${resultat}`, 10, 40);

    // Spara PDF-filen
    const pdfFileName = `arsredovisning_${rakenskapsar}.pdf`;
    pdf.save(pdfFileName);

    // Visa resultat på sidan
    document.getElementById('result').innerText = 'Årsredovisning PDF skapad!';


});
 */