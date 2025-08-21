import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Head>
        <title>Eredovisning - Gör din årsredovisning online</title>
        <meta name="description" content="Klon av edeklarera.se" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Eredovisning
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="#" className="text-gray-600 hover:text-blue-600">Våra tjänster</Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">Priser</Link>
            <Link href="#" className="text-gray-600 hover:text-blue-600">Frågor & svar</Link>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 font-semibold">
              Logga in
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-50">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-2">Eredovisning</h3>
               <p className="text-gray-500 text-sm">© Eredovisning Sverige AB 2025</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Produkt</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Årsredovisning</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">SRU-filer</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Priser</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Hjälp</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Frågor & svar</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Kontakt</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-blue-600">Användarvillkor</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold mb-2">Sociala medier</h3>
               {/* Placeholders for social icons */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
