// src/components/Step2_Resultatrakning.tsx
import React, { useEffect, useState } from "react";



export interface Account {
  account_number: string;
  account_name: string;
  balance: number;
}

export interface ResultatPost {
  title: string;
  group: string;
  editable: boolean;
  accounts: Account[];
  override?: number;
}

interface Props {
  formData: any;
  accounts: Account[];
  onNext: (updatedAccounts: Account[]) => void;
  onBack: () => void;
}


const Step2_Resultatrakning: React.FC<Props> = ({
  accounts = [],
  onNext,
  onBack,
}) => {
  const [posts, setPosts] = useState<ResultatPost[]>([]);

  /* ---------- gruppera BAS-konton ---------- */
  const buildPosts = (accounts: Account[]): ResultatPost[] => {
    const pick = (low: number, high: number) =>
      accounts.filter((a) => {
        const n = parseInt(a.account_number, 10);
        return n >= low && n <= high;
      });

    return [
      {
        title: "Nettoomsättning",
        group: "Rörelseintäkter, lagerförändringar m.m.",
        editable: false,
        accounts: pick(3000, 3799),
      },
      {
        title: "Förändring av lager",
        group: "Rörelseintäkter, lagerförändringar m.m.",
        editable: true,
        accounts: pick(4900, 4999),
      },
      {
        title: "Övriga rörelseintäkter",
        group: "Rörelseintäkter, lagerförändringar m.m.",
        editable: false,
        accounts: pick(8000, 8099),
      },
      {
        title: "Råvaror och förnödenheter",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(4000, 4099),
      },
      {
        title: "Handelsvaror",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(4100, 4199),
      },
      {
        title: "Övriga externa kostnader",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(6000, 6999),
      },
      {
        title: "Personalkostnader",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(7000, 7099),
      },
      {
        title: "Av- och nedskrivningar",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(7800, 7899),
      },
      {
        title: "Övriga rörelsekostnader",
        group: "Rörelsekostnader",
        editable: false,
        accounts: pick(7700, 7799),
      },
      {
        title: "Övriga ränteintäkter",
        group: "Finansiella poster",
        editable: false,
        accounts: pick(8300, 8399),
      },
      {
        title: "Räntekostnader",
        group: "Finansiella poster",
        editable: false,
        accounts: pick(8400, 8499),
      },
    ];
  };

  useEffect(() => {
    setPosts(buildPosts(accounts));
  }, [accounts]);

  /* ---------- summering ---------- */
  const sumPost = (p: ResultatPost) =>
    p.editable && p.override !== undefined
      ? p.override
      : p.accounts.reduce((t, a) => t + a.balance, 0);

  const groupTotals = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.group] = (acc[p.group] || 0) + sumPost(p);
    return acc;
  }, {});

  const resultatForeSkatt =
    (groupTotals["Rörelseintäkter, lagerförändringar m.m."] || 0) +
    (groupTotals["Rörelsekostnader"] || 0) +
    (groupTotals["Finansiella poster"] || 0);

  /* ---------- ändringar ---------- */
  const handleOverride = (index: number, value: number) => {
    const updated = [...posts];
    updated[index].override = value;
    setPosts(updated);
  };

  /* ---------- spara & gå vidare ---------- */
  const handleNext = () => {
    let updatedAccounts = [...accounts];

    posts.forEach((post) => {
      if (!post.editable || post.override === undefined) return;

      const diff =
        post.override -
        post.accounts.reduce((t, a) => t + a.balance, 0);
      if (diff === 0 || post.accounts.length === 0) return;

      const target = updatedAccounts.find(
        (a) => a.account_number === post.accounts[0].account_number
      );
      if (target) target.balance += diff;
    });

    onNext(updatedAccounts);
  };

  console.log("Step2 – raw accounts:", accounts);
console.log("Step2 – Nettoomsättning pick:", accounts.filter(a => {
  const n = parseInt(a.account_number, 10);
  return n >= 3000 && n <= 3799;
}));
console.log("Step2 – buildPosts result:", buildPosts(accounts));

  /* ---------- render ---------- */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Resultaträkning</h2>
      <p className="mb-6 text-gray-600">
        Granska och justera saldon för resultaträkningen.
      </p>

      {Object.entries(groupTotals).map(([group, total]) => (
        <div key={group} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{group}</h3>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="py-2 px-4">Post</th>
                <th className="py-2 px-4 text-right">Belopp (kr)</th>
              </tr>
            </thead>
            <tbody>
              {posts
                .filter((p) => p.group === group)
                .map((p, idx) => (
                  <tr key={p.title} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-medium">{p.title}</td>
                    <td className="py-2 px-4 text-right">
                      {p.editable ? (
                        <input
                          type="number"
                          value={p.override ?? sumPost(p)}
                          onChange={(e) =>
                            handleOverride(
                              posts.findIndex((x) => x.title === p.title),
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-28 border rounded px-1 text-right"
                        />
                      ) : (
                        sumPost(p).toLocaleString("sv-SE")
                      )}
                    </td>
                  </tr>
                ))}
              <tr className="bg-gray-100 font-semibold">
                <td className="py-2 px-4">Summa {group}</td>
                <td className="py-2 px-4 text-right">
                  {(total || 0).toLocaleString("sv-SE")} kr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-6 font-bold text-right">
        Resultat före skatt: {resultatForeSkatt.toLocaleString("sv-SE")} kr
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600"
        >
          Tillbaka
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-600"
        >
          Nästa (Balansräkning)
        </button>
      </div>
    </div>
  );
};

export default Step2_Resultatrakning;