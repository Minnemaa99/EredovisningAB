import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Eredovisning - Digital årsredovisning & deklaration</title>
        <meta name="description" content="Klient för edeklarera.se" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Eredovisning
          </Link>
          <div className="flex items-center">
            <Link href="/arsredovisning" className="text-gray-600 hover:text-gray-800 px-3 py-2">
              Årsredovisning
            </Link>
            <Link href="/priser" className="text-gray-600 hover:text-gray-800 px-3 py-2">
              Priser
            </Link>
            <Link href="/fragor-och-svar" className="text-gray-600 hover:text-gray-800 px-3 py-2">
              Frågor & svar
            </Link>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full ml-4">
              Logga in
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Chat Bubble Placeholder */}
      <div className="fixed bottom-5 right-5">
        <button className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
          {/* SVG icon for chat */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      <footer className="bg-gray-100">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">Eredovisning</h3>
              <p className="text-gray-600">
                Gör din årsredovisning och inkomstdeklaration online.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Produkt</h3>
              <ul className="space-y-1">
                <li><Link href="/arsredovisning" className="text-gray-600 hover:text-gray-800">Årsredovisning</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">SRU-filer</Link></li>
                <li><Link href="/priser" className="text-gray-600 hover:text-gray-800">Priser</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Lexikon</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Årsredovisning mall</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Hjälp</h3>
              <ul className="space-y-1">
                <li><Link href="/fragor-och-svar" className="text-gray-600 hover:text-gray-800">Frågor & svar</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Kontakt</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Användarvillkor</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Integritetspolicy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-gray-800">Om oss</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-4 text-center text-gray-500">
            <p>© Eredovisning Sverige AB 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
