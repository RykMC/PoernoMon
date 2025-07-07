import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";

const METRICS = [
  { label: "Kämpfe insgesamt", value: "kaempfe_insgesamt" },
  { label: "Siege", value: "siege" },
  { label: "Niederlagen", value: "niederlagen" },
  { label: "Siege in Folge", value: "siege_in_folge" },
  { label: "Höchste Siege in Folge", value: "höchste_siege_in_folge" },
  { label: "Niederlagen in Folge", value: "niederlagen_in_folge" },
  { label: "Höchste Niederlagen in Folge", value: "höchste_niederlagen_in_folge" },
  { label: "Gesamt Schaden ausgeteilt", value: "gesamt_schaden_ausgeteilt" },
  { label: "Gesamt Schaden erhalten", value: "gesamt_schaden_erhalten" },
  { label: "Geblockter Schaden", value: "geblockter_schaden" },
  { label: "Höchster Schaden mit einem Schlag", value: "höchster_schaden_mit_einem_schlag" },
  { label: "Kritische Treffer", value: "kritische_treffer" },
  { label: "Ausgewichen", value: "ausgewichen" },
  { label: "XP", value: "xp" },
  { label: "Items gecraftet", value: "items_gecraftet" }
];

export default function StatistikModal({ onClose }) {
  const [metric, setMetric] = useState("kaempfe_insgesamt");
  const [ranking, setRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoadingRanking(true);
        const res = await api.get(`/statistik/ranking/${metric}`);
        setRanking(res.data);
      } catch (err) {
        console.error("Fehler beim Laden des Rankings:", err);
      } finally {
        setLoadingRanking(false);
      }
    };
    loadRanking();
  }, [metric]);

  
  return (
    <div className="flex flex-col w-full max-w-7xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ranking</h2>
        <select
          className="bg-gray-800 text-white p-2 rounded"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          {METRICS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-grow h-120">
        {/* Linke Seite: Treppchen */}
      <div className="w-1/2 flex justify-center items-end -space-x-20 ">
        {ranking[1] && (
          <div className="flex flex-col items-center relative">
            <div className="mt-2 font-bold text-xl bg-gradient-to-r from-gray-400 to-gray-200 text-transparent bg-clip-text drop-shadow-lg">
              2. Platz
            </div>
            <div className="relative w-[280px] h-[280px]">
              <img src={`/${ranking[1].kreatur_bild}`} className="absolute w-full h-full" alt="2. Platz" />
            </div>
            <img src="/images/global/silber.png" alt="Pokal" className="absolute top-37 left-15 rotate-330 w-12 mb-2" />
            <div className="mt-2 font-bold text-sm">{ranking[1].username}</div>
          </div>
        )}
        {ranking[0] && (
          <div className="flex flex-col items-center relative">
          <div className="mt-2 font-bold text-xl bg-gradient-to-r from-yellow-400 to-yellow-200 text-transparent bg-clip-text drop-shadow-lg">
            1. Platz
          </div>
            <div className="relative w-[280px] h-[280px]">
              <img src={`/${ranking[0].kreatur_bild}`} className="absolute w-full h-full" alt="1. Platz" />
            </div>
            <img src="/images/global/gold.png" alt="Pokal" className="w-16 mb-2 absolute top-33 left-15 " />
            <div className="mt-2 font-bold text-sm">{ranking[0].username}</div>
          </div>
        )}
        {ranking[2] && (
          <div className="flex flex-col items-center relative">
            <div className="mt-2 font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-400 text-transparent bg-clip-text drop-shadow-lg">
              3. Platz
            </div>
            <div className="relative w-[280px] h-[280px]">
              <img src={`/${ranking[2].kreatur_bild}`} className="absolute w-full h-full" alt="3. Platz" />
            </div>
            <img src="/images/global/bronze.png" alt="Pokal" className="w-12 mb-2 absolute top-37 right-15 rotate-10" />
            <div className="mt-2 font-bold text-sm">{ranking[2].username}</div>
          </div>
        )}
      </div>

        {/* Rechte Seite: Ranking Liste */}
        <div className="w-1/2 pl-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">
            🏆 Ranking nach {METRICS.find(m => m.value === metric)?.label}
          </h3>
          {loadingRanking ? (
            <div className="flex justify-center items-center h-full"><Loader /></div>
          ) : (
            <div className="space-y-4">
              {ranking.map((spieler, idx) => (
                <div key={spieler.user_id} className="flex items-center bg-gray-800 p-3 rounded gap-4 shadow">
                  <div className="relative w-[100px] h-[100px] flex-shrink-0">
                    {spieler.background_bild && (
                      <img src={`/${spieler.background_bild}`} className="absolute w-full h-full" alt="bg"/>
                    )}
                    <img src={`/${spieler.kreatur_bild}`} className="absolute w-full h-full" alt="kreatur"/>
                    {spieler.frame_bild && (
                      <img src={`/${spieler.frame_bild}`} className="absolute w-full h-full" alt="frame"/>
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-bold text-lg">{idx + 1}. {spieler.username}</div>
                    <div className="text-sm text-gray-400">
                      {METRICS.find(m => m.value === metric)?.label}: <span className="font-semibold">{spieler[metric]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      <div className="text-center mt-6">
        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded cursor-pointer transform transition hover:scale-90"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}
