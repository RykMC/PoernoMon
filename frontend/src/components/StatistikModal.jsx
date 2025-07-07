import { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "./Loader";
import { useGame } from "../context/GameContext";


export default function StatistikModal({ onClose }) {
  const [stats, setStats] = useState(null);
  const [kaempfe, setKaempfe] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingKaempfe, setLoadingKaempfe] = useState(true);
  const { spieler, poernomon } = useGame();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get("/statistik/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoadingKaempfe(true);
        const res = await api.get(`/statistik/kaempfe`);
        setKaempfe(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Fehler beim Laden des Rankings:", err);
      } finally {
        setLoadingKaempfe(false);
      }
    };
    loadRanking();
  }, []);

  function berechneSiegquote() {
    if (!stats) return "-";
    const total = stats.siege + stats.niederlagen;
    return total > 0 ? `${((stats.siege / total) * 100).toFixed(1)} %` : "0 %";
  }

  return (
    <div className="flex flex-col w-full max-w-7xl text-white">
      
      <div className="flex flex-grow h-120">
        {/* Linke Seite: Stats */}
        <div className="w-1/2 border-r border-white/20 overflow-y-auto pr-6">
          <h2 className="text-xl font-bold mb-4">📊 Deine Statistiken</h2>
          {loadingStats ? (
            <div className="flex justify-center items-center h-full"><Loader /></div>
          ) : (
            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Allgemein</h4>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Level</span><span>{stats.level}</span></div>
                  <div className="flex justify-between"><span>XP</span><span>{stats.xp}</span></div>
                  <div className="flex justify-between"><span>Kämpfe insgesamt</span><span>{stats.kaempfe_insgesamt}</span></div>
                  <div className="flex justify-between"><span>Siegquote</span><span>{berechneSiegquote()}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mt-4 mb-1">Kampfergebnisse</h4>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Siege</span><span>{stats.siege}</span></div>
                  <div className="flex justify-between"><span>Niederlagen</span><span>{stats.niederlagen}</span></div>
                  <div className="flex justify-between"><span>Siege in Folge</span><span>{stats.siege_in_folge}</span></div>
                  <div className="flex justify-between"><span>Höchste Siege in Folge</span><span>{stats.höchste_siege_in_folge}</span></div>
                  <div className="flex justify-between"><span>Niederlagen in Folge</span><span>{stats.niederlagen_in_folge}</span></div>
                  <div className="flex justify-between"><span>Höchste Niederlagen in Folge</span><span>{stats.höchste_niederlagen_in_folge}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mt-4 mb-1">Kampfaktionen</h4>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Kritische Treffer</span><span>{stats.kritische_treffer}</span></div>
                  <div className="flex justify-between"><span>Kritische Treffer erhalten</span><span>{stats.kritische_treffer_erhalten}</span></div>
                  <div className="flex justify-between"><span>Ausgewichen</span><span>{stats.ausgewichen}</span></div>
                  <div className="flex justify-between"><span>Angriffe verfehlt</span><span>{stats.angriffe_verfehlt}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mt-4 mb-1">Schaden</h4>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Gesamt Schaden ausgeteilt</span><span>{stats.gesamt_schaden_ausgeteilt}</span></div>
                  <div className="flex justify-between"><span>Gesamt Schaden erhalten</span><span>{stats.gesamt_schaden_erhalten}</span></div>
                  <div className="flex justify-between"><span>Geblockter Schaden</span><span>{stats.geblockter_schaden}</span></div>
                  <div className="flex justify-between"><span>Höchster Schaden mit einem Schlag</span><span>{stats.höchster_schaden_mit_einem_schlag}</span></div>
                  <div className="flex justify-between"><span>Höchster XP in einem Kampf</span><span>{stats.höchste_xp_in_einem_kampf}</span></div>
                  <div className="flex justify-between"><span>Höchster Kampfstaub in einem Kampf</span><span>{stats.höchste_kampfstaub_in_einem_kampf}</span></div>
                  <div className="flex justify-between"><span>Höchster Gewinn in Coins</span><span>{stats.höchster_gewinn_in_coins}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mt-4 mb-1">Wirtschaft & Items</h4>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>Coins verdient</span><span>{stats.gesamt_coins_verdient}</span></div>
                  <div className="flex justify-between"><span>Coins ausgegeben</span><span>{stats.coins_ausgegeben}</span></div>
                  <div className="flex justify-between"><span>Kampfstaub verdient</span><span>{stats.gesamt_kampfstaub_verdient}</span></div>
                  <div className="flex justify-between"><span>Kampfstaub ausgegeben</span><span>{stats.kampfstaub_ausgegeben}</span></div>
                  <div className="flex justify-between"><span>Items gekauft</span><span>{stats.items_gekauft}</span></div>
                  <div className="flex justify-between"><span>Items verkauft</span><span>{stats.items_verkauft}</span></div>
                  <div className="flex justify-between"><span>Items gecraftet</span><span>{stats.items_gecraftet}</span></div>
                  <div className="flex justify-between"><span>Items zerstört</span><span>{stats.items_entcraftet}</span></div>
                  <div className="flex justify-between"><span>Kampfstaub durch Zerstörung</span><span>{stats.kampfstaub_durch_entcraften}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rechte Seite: Ranking */}
        <div className="w-1/2 pl-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">⚔️ Deine Kämpfe</h2>
          {loadingKaempfe ? (
            <div className="flex justify-center items-center h-full"><Loader /></div>
          ) : (
            <div className="space-y-4">
              {kaempfe.map((kampf, idx) => {
          const hastMehrAngegriffen = kampf.angriffe_von_dir > kampf.gesamt_kaempfe / 2;

  return (
    <div key={idx} className="flex items-center bg-gray-800 p-3 rounded gap-4 shadow">
      {hastMehrAngegriffen ? (
        <>
          {/* Dein Bild links */}
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            {poernomon.background_bild && (
              <img src={`/${poernomon.background_bild}`} className="absolute w-full h-full" alt="bg"/>
            )}
            <img src={`/${poernomon.kreatur_bild}`} className="absolute w-full h-full" alt="kreatur"/>
            {poernomon.frame_bild && (
              <img src={`/${poernomon.frame_bild}`} className="absolute w-full h-full" alt="frame"/>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center text-sm flex-grow">
            <div>
              Du hast <span className="font-bold">{kampf.gegner_username}</span> insgesamt <span className="font-bold">{kampf.angriffe_von_dir}</span>x angegriffen.
            </div>
            <div className="text-gray-400">
              Ihr habt insgesamt <span className="font-bold">{kampf.gesamt_kaempfe}</span>x gekämpft,
              du hast <span className="font-bold">{kampf.siege_von_dir}</span>x gewonnen.
            </div>
          </div>

          {/* Gegner rechts */}
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            {kampf.gegner_background_bild && (
              <img src={`/${kampf.gegner_background_bild}`} className="absolute w-full h-full" alt="bg"/>
            )}
            <img src={`/${kampf.gegner_kreatur_bild}`} className="absolute w-full h-full" alt="kreatur"/>
            {kampf.gegner_frame_bild && (
              <img src={`/${kampf.gegner_frame_bild}`} className="absolute w-full h-full" alt="frame"/>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Gegner links */}
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            {kampf.gegner_background_bild && (
              <img src={`/${kampf.gegner_background_bild}`} className="absolute w-full h-full" alt="bg"/>
            )}
            <img src={`/${kampf.gegner_kreatur_bild}`} className="absolute w-full h-full" alt="kreatur"/>
            {kampf.gegner_frame_bild && (
              <img src={`/${kampf.gegner_frame_bild}`} className="absolute w-full h-full" alt="frame"/>
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center text-sm flex-grow">
            <div>
              <span className="font-bold">{kampf.gegner_username}</span> hat dich insgesamt <span className="font-bold">{kampf.gesamt_kaempfe - kampf.angriffe_von_dir}</span>x angegriffen.
            </div>
            <div className="text-gray-400">
              Ihr habt insgesamt <span className="font-bold">{kampf.gesamt_kaempfe}</span>x gekämpft,
              du hast <span className="font-bold">{kampf.siege_von_dir}</span>x gewonnen.
            </div>
          </div>

          {/* Dein Bild rechts */}
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            {poernomon.background_bild && (
              <img src={`/${poernomon.background_bild}`} className="absolute w-full h-full" alt="bg"/>
            )}
            <img src={`/${poernomon.kreatur_bild}`} className="absolute w-full h-full" alt="kreatur"/>
            {poernomon.frame_bild && (
              <img src={`/${poernomon.frame_bild}`} className="absolute w-full h-full" alt="frame"/>
            )}
          </div>
        </>
      )}
    </div>
  );
})}

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
