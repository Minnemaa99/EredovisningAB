import Head from 'next/head';
import Wizard from '../../components/wizard/Wizard';

export default function NewReportPage() {
  return (
    <>
      <Head>
        <title>Skapa Ny Årsredovisning - Eredovisning</title>
      </Head>
      <div className="container mx-auto px-6 py-12">
        <Wizard />
      </div>
    </>
  );
}
