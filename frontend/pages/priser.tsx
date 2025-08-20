import Head from 'next/head';
import Link from 'next/link';

export default function PriserPage() {
  return (
    <>
      <Head>
        <title>Priser - Eredovisning</title>
      </Head>

      <div className="container mx-auto px-6 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold">Priser</h1>
          <p className="mt-4 text-lg text-gray-600">
            Prova våra tjänster helt kostnadsfritt. Du betalar bara vid inlämning.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Main Product */}
          <div className="border-2 border-blue-600 rounded-lg p-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold">Årsredovisning & deklaration</h2>
            <p className="mt-4 text-5xl font-extrabold">899 kr</p>
            <p className="text-gray-500">/ bolag (exkl. moms)</p>
            <ul className="mt-6 text-left space-y-2">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Digital inlämning</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Enligt K2-regelverket</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Importera bokföring</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Inkomstdeklaration 2</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Skatteberäkning</li>
            </ul>
            <Link href="#" className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700">
              Börja här
            </Link>
          </div>

          {/* Second Product */}
          <div className="border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold">Deklaration företag</h2>
            <p className="mt-4 text-5xl font-extrabold">699 kr</p>
            <p className="text-gray-500">/ bolag (exkl. moms)</p>
            <ul className="mt-6 text-left space-y-2">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> SRU-filer för Skatteverket</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Importera bokföring</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Stöd för alla bolagsformer</li>
            </ul>
            <Link href="#" className="mt-8 inline-block bg-gray-600 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700">
              Börja här
            </Link>
          </div>

          {/* Third Product */}
          <div className="border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold">Deklaration privatperson</h2>
            <p className="mt-4 text-5xl font-extrabold">499 kr</p>
            <p className="text-gray-500">/ person (inkl. moms)</p>
            <ul className="mt-6 text-left space-y-2">
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> SRU-filer för Skatteverket</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Blankett K4</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> NE-bilaga</li>
            </ul>
            <Link href="#" className="mt-8 inline-block bg-gray-600 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700">
              Börja här
            </Link>
          </div>
        </div>

        <div className="text-center mt-16">
            <h2 className="text-2xl font-bold">Behöver ni en anpassad lösning?</h2>
            <p className="mt-4 text-gray-700">Redovisningsbyrå? Vi erbjuder även årslicens till ett förmånligt pris.</p>
            <Link href="#" className="mt-6 inline-block text-blue-600 font-bold hover:underline">
              Kontakta oss för en skräddarsydd lösning
            </Link>
        </div>
      </div>
    </>
  );
}
