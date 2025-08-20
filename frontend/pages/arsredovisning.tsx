import Head from 'next/head';
import Link from 'next/link';

export default function ArsredovisningPage() {
  return (
    <>
      <Head>
        <title>Årsredovisning Online - Eredovisning</title>
      </Head>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Årsredovisning enkelt online</h1>
          <p className="mt-4 text-lg text-gray-600">Direkt till Bolagsverket</p>
          <Link href="/arsredovisning/ny" className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700">
            Gör min årsredovisning nu!
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold">Digital årsredovisning</h2>
            <p className="mt-4 text-gray-700">
              Gör din årsredovisning online själv med digital inlämning, helt pappersfritt. Fyll i för hand eller importera ditt företags bokföring. Deklaration ingår.
            </p>
            <h2 className="text-3xl font-bold mt-8">För aktiebolag</h2>
            <p className="mt-4 text-gray-700">
              Fyll dina uppgifter i vårt webbaserade program och få en korrekt uppställd årsredovisning för ditt företag. Allt enligt K2-regelverket.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-200 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold">Komplett bokslut. Prisvärt och enkelt.</h3>
              <p className="mt-4">Prova gratis och betala när du är redo att signera och lämna in. Inkomstdeklaration 2 ingår.</p>
              <div className="mt-6 text-5xl font-bold">
                899 kr
              </div>
              <p className="text-gray-600">/ bolag (exkl. moms)</p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Artiklar och guider</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Viktiga datum</h3>
              <p className="text-gray-600">Håll koll på alla viktiga datum för din årsredovisning och deklaration.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Digital inlämning</h3>
              <p className="text-gray-600">Lär dig mer om fördelarna med att lämna in din årsredovisning digitalt.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Importera från SIE-fil</h3>
              <p className="text-gray-600">En guide till hur du enkelt importerar din bokföring från en SIE-fil.</p>
            </div>
          </div>
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Vanliga frågor</h2>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-xl">Vad är en årsredovisning?</h4>
              <p className="mt-2 text-gray-700">Årsredovisningen är en offentlig finansiell rapport som visar företagets ställning och resultat. Den består av balansräkning och resultaträkning med efterföljande noter och kommentarer samt förvaltningsberättelse.</p>
            </div>
            <div>
              <h4 className="font-semibold text-xl">Vem måste göra en årsredovisning?</h4>
              <p className="mt-2 text-gray-700">Aktiebolag och ekonomiska föreningar måste årligen upprätta en årsredovisning. Även andra bolagsformer kan bli skyldiga att upprätta en årsredovisning beroende på bolagets storlek.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
