import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Head from 'next/head';

// This should match the Pydantic schema in the backend
interface Company {
  id: number;
  orgnummer: string;
  name: string;
  address_info: string | null;
}

const API_URL = 'http://localhost:8000'; // Assuming the backend is running here

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [orgnummer, setOrgnummer] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/companies/`);
      setCompanies(response.data);
      setError(null);
    } catch (err) {
      setError('Kunde inte hämta företag. Kontrollera att backend-servern är igång.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!orgnummer || !name) {
      setError('Organisationsnummer och namn är obligatoriska fält.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/companies/`, {
        orgnummer,
        name,
        address_info: address,
      });
      setCompanies([...companies, response.data]);
      // Clear form
      setOrgnummer('');
      setName('');
      setAddress('');
      setError(null);
    } catch (err) {
      setError('Kunde inte skapa företag.');
      console.error(err);
    }
  };

  return (
    <div>
      <Head>
        <title>Företagsöversikt - edeklarera.se</title>
      </Head>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Lägg till nytt företag</h2>
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-white shadow">
          <div className="mb-4">
            <label htmlFor="orgnummer" className="block text-sm font-medium text-gray-700">Organisationsnummer</label>
            <input
              type="text"
              id="orgnummer"
              value={orgnummer}
              onChange={(e) => setOrgnummer(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Företagsnamn</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adress</label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Skapa företag
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Mina Företag</h2>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {companies.length > 0 ? (
              companies.map((company) => (
                <li key={company.id}>
                  <a href="#" className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">{company.name}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Org.nr: {company.orgnummer}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {company.address_info || 'Adress saknas'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-center text-gray-500">
                Inga företag hittades.
              </li>
            )}
            {/* Example of a company with files and payment flow */}
            {companies.length > 0 && (
              <li className="bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">{companies[0].name} (Exempelfiler)</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">Årsredovisning 2023</p>
                      <button
                        onClick={() => alert('Ska ladda ner PDF')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        // disabled={!isPaid} // Placeholder for payment state
                      >
                        Ladda ner PDF
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">SRU-fil 2023</p>
                      <button
                        onClick={() => alert('Ska ladda ner SRU')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        // disabled={!isPaid} // Placeholder for payment state
                      >
                        Ladda ner SRU
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => alert('Ska anropa /api/pay')}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Betala för att ladda ner
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
