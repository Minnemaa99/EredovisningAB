import Head from 'next/head';

const FAQItem = ({ question, answer }) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold">{question}</h3>
    <p className="mt-2 text-gray-700">{answer}</p>
  </div>
);

export default function FaqPage() {
  return (
    <>
      <Head>
        <title>Frågor & Svar - Eredovisning</title>
      </Head>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold">Frågor & Svar</h1>
          <p className="mt-4 text-lg text-gray-600">
            Här har vi samlat de vanligaste frågorna vi får om vår tjänst.
          </p>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <FAQItem
            question="Vad kostar det?"
            answer="Vår prissättning är enkel. Du betalar en fast avgift per bolag och år när du är redo att lämna in. Inga dolda avgifter eller månadskostnader. Se vår prissida för aktuella priser."
          />
          <FAQItem
            question="Vilka bolagsformer stödjer ni?"
            answer="Vår huvudsakliga tjänst för årsredovisning och inkomstdeklaration är byggd för svenska aktiebolag (AB) som följer K2-regelverket. Vår separata deklarationstjänst har stöd för fler bolagsformer."
          />
          <FAQItem
            question="Hur importerar jag min bokföring?"
            answer="Du kan importera din bokföring genom att ladda upp en SIE-fil, vilket är ett standardformat som de flesta svenska bokföringsprogram kan exportera. Vi har även stöd för direktintegration med Fortnox."
          />
          <FAQItem
            question="Är det säkert?"
            answer="Ja, säkerhet är vår högsta prioritet. All dataöverföring är krypterad och vi lagrar din information på säkra servrar. Vi använder oss av branschstandard för inloggning och autentisering."
          />
          <FAQItem
            question="Vad händer om jag gör fel?"
            answer="Vårt program har inbyggda kontroller som varnar för vanliga fel, till exempel om din balansräkning inte balanserar. Vi erbjuder även support via chatt och e-post om du skulle köra fast."
          />
        </div>
      </div>
    </>
  );
}
