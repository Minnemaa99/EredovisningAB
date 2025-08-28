import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Eredovisning - Gör din årsredovisning och deklaration online</title>
      </Head>

      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            Gör din årsredovisning och inkomstdeklaration online
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Genom vårt bokslutsprogram - direkt i webbläsaren.
          </p>
          <div className="mt-8">
            <Link href="/arsredovisning/ny" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full hover:bg-blue-700 text-lg">
              Årsredovisning
            </Link>
            <Link href="/inkomstdeklaration/ny" className="ml-4 bg-gray-200 text-gray-800 font-bold py-4 px-8 rounded-full hover:bg-gray-300 text-lg">
              Inkomstdeklaration
            </Link>
          </div>
        </div>
      </section>

      {/* Logos Section Placeholder */}
      <div className="text-center py-8">
        <p className="text-gray-500">Kopplat med Bolagsverket & Fortnox</p>
      </div>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">Varför Eredovisning?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Inga månadskostnader</h3>
              <p className="text-gray-600">Betala endast för vad du behöver - när du behöver det.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Allt i molnet</h3>
              <p className="text-gray-600">Använd oberoende av bokföringsprogram, direkt i din webbläsare.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Kunnig support</h3>
              <p className="text-gray-600">Vi hjälper dig vid behov och ser till att dina handlingar lämnas in i tid.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">1000+ nöjda företagsanvändare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">"Väldigt prisvärd och smidig onlinetjänst! Rekommenderar starkt till alla som vill göra sin årsredovisning själv."</p>
              <p className="mt-4 font-bold">- Jan</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">"Tack för en suverän tjänst och hjälpsam support."</p>
              <p className="mt-4 font-bold">- Anna</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600">"Väldigt smidigt och enkelt. Rekommenderar starkt!"</p>
              <p className="mt-4 font-bold">- Marwin</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
