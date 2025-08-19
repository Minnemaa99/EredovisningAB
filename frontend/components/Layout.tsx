import React from 'react';
import Head from 'next/head';

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>edeklarera.se</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <header className="bg-gray-800 text-white p-4">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl">edeklarera.se</h1>
          <div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
              Logga in
            </button>
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Logga ut
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
      <footer className="bg-gray-200 text-center p-4 mt-8">
        <p>© 2024 edeklarera.se - En del av Framtidsbyrån AB</p>
      </footer>
    </>
  );
};

export default Layout;
