import Head from 'next/head';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBuilding, FaUserTie, FaFileImport, FaKeyboard, FaChevronLeft } from 'react-icons/fa';
import CompanyTypeSelector from '../../components/inkomstdeklaration/CompanyTypeSelector';
import ImportOrManualSelector from '../../components/inkomstdeklaration/ImportOrManualSelector';
import BlankettDropdown from '../../components/inkomstdeklaration/BlankettDropdown';
import BlankettForm from '../../components/inkomstdeklaration/BlankettForm';
import Link from 'next/link';
import { AnnualReportProvider } from '../../context/AnnualReportContext';

const stepVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export default function IncomeDeclarationPage() {
  return (
    <AnnualReportProvider>
      <Inner />
    </AnnualReportProvider>
  );
}

function Inner() {
  const [companyType, setCompanyType] = useState<"ab" | "enskild" | null>(null);
  const [importMethod, setImportMethod] = useState<"sie" | "manual" | null>(null);
  const [blankett, setBlankett] = useState<string | null>(null);

  // Återställ steg om man går tillbaka
  const handleCompanyType = (type: "ab" | "enskild") => {
    setCompanyType(type);
    setImportMethod(null);
    setBlankett(null);
  };
  const handleImportMethod = (method: "sie" | "manual") => {
    setImportMethod(method);
    setBlankett(null);
  };
  const handleBlankett = (b: string) => setBlankett(b);

  // Stegindikator
  const step = !companyType ? 1 : !importMethod ? 2 : !blankett ? 3 : 4;

  return (
    <>
      <Head>
        <title>Inkomstdeklaration - Skapa ny deklaration</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white/95 shadow-xl rounded-2xl p-6 mt-10 mb-6 border border-blue-100">
          {/* Stegindikator */}
          <div className="flex items-center justify-center gap-2 mb-4 text-blue-700 text-xs font-semibold">
            <span className={step >= 1 ? "text-blue-700" : "text-gray-400"}><FaBuilding className="inline mr-1" />Företagsform</span>
            <span>›</span>
            <span className={step >= 2 ? "text-blue-700" : "text-gray-400"}><FaFileImport className="inline mr-1" />Import</span>
            <span>›</span>
            <span className={step >= 3 ? "text-blue-700" : "text-gray-400"}><FaKeyboard className="inline mr-1" />Blankett</span>
          </div>

          <h1 className="text-xl font-bold text-center text-blue-900 mb-4 tracking-tight">
            Ny Inkomstdeklaration
          </h1>

          <AnimatePresence mode="wait">
            {!companyType && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-4">
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium shadow transition"
                    onClick={() => handleCompanyType("ab")}
                  >
                    <FaBuilding /> Aktiebolag m.fl.
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 font-medium shadow transition"
                    onClick={() => handleCompanyType("enskild")}
                  >
                    <FaUserTie /> Enskild firma
                  </button>
                </div>
              </motion.div>
            )}

            {companyType && !importMethod && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col gap-4">
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium shadow transition"
                    onClick={() => handleImportMethod("sie")}
                  >
                    <FaFileImport /> Importera bokföring (SIE-fil)
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium shadow transition"
                    onClick={() => handleImportMethod("manual")}
                  >
                    <FaKeyboard /> Fyll i manuellt
                  </button>
                </div>
              </motion.div>
            )}

            {companyType && importMethod && !blankett && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <BlankettDropdown companyType={companyType} onSelect={handleBlankett} />
              </motion.div>
            )}

            {companyType && importMethod && blankett && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <BlankettForm
                  companyType={companyType}
                  blankett={blankett}
                  importMethod={importMethod}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tillbaka-knapp */}
          <div className="mt-6 flex justify-between items-center">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              Till startsidan
            </Link>
            {(companyType || importMethod || blankett) && (
              <button
                className="flex items-center gap-1 text-gray-500 hover:text-blue-700 text-sm"
                onClick={() => {
                  if (blankett) setBlankett(null);
                  else if (importMethod) setImportMethod(null);
                  else if (companyType) setCompanyType(null);
                }}
              >
                <FaChevronLeft /> Tillbaka
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}