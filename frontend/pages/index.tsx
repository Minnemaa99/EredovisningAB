import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>Eredovisning - Digital årsredovisning & deklaration online</title>
      </Head>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white">
        <div className="container mx-auto text-center px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Gör din årsredovisning och inkomstdeklaration online
          </h1>
          <p className="mt-4 text-lg">
            Direkt i webbläsaren, kopplat med Bolagsverket och Fortnox.
          </p>
          <div className="mt-8">
            <Link href="/arsredovisning" className="bg-white text-blue-600 font-bold py-3 px-6 rounded-full hover:bg-gray-200">
              Skapa årsredovisning
            </Link>
            <Link href="#" className="ml-4 bg-transparent border border-white font-bold py-3 px-6 rounded-full hover:bg-blue-500">
              Skapa inkomstdeklaration
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Varför Eredovisning?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-2">Inga månadskostnader</h3>
              <p className="text-gray-600">Betala endast för vad du behöver - när du behöver det.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Allt i molnet</h3>
              <p className="text-gray-600">Använd oberoende av bokföringsprogram, direkt i din webbläsare.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Kunnig support</h3>
              <p className="text-gray-600">Vi hjälper dig vid behov och ser till att dina handlingar lämnas in i tid.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-100 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">1000+ nöjda företagsanvändare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">"Väldigt prisvärd och smidig onlinetjänst! Rekommenderar starkt till alla som vill göra sin årsredovisning själv."</p>
              <p className="mt-4 font-bold">- Jan</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">"Tack för en suverän tjänst och hjälpsam support."</p>
              <p className="mt-4 font-bold">- Anna</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">"Väldigt smidigt och enkelt. Rekommenderar starkt!"</p>
              <p className="mt-4 font-bold">- Marwin</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Hur Eredovisning fungerar</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Med Eredovisning slipper du lägga tid på komplicerade bokslutsprogram. Vi erbjuder ett prisvärt, enkelt och molnbaserat deklarationsprogram för digital inlämning.
          </p>
          <div className="mt-8">
            {/* Placeholder for YouTube video */}
            <div className="bg-gray-300 w-full max-w-3xl mx-auto h-80 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">Video-guide här</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
