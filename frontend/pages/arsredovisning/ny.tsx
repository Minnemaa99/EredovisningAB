import Head from 'next/head';
import Wizard from '../../components/Wizard';

export default function NewAnnualReportPage() {
  return (
    <>
      <Head>
        <title>Ny Årsredovisning - Eredovisning</title>
      </Head>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Skapa ny årsredovisning</h1>
        <Wizard />
      </div>
    </>
  );
}
