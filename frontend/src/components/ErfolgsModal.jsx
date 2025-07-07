import { useEffect, useState } from "react";
import api from "../api/axios";
import { useGame } from "../context/GameContext";

export default function ErfolgeModal({ onClose }) {
  const [alleErfolge, setAlleErfolge] = useState([]);
  const [freigeschalteteErfolge, setFreigeschalteteErfolge] = useState([]);
  const [sortierteErfolge, setSortierteErfolge] = useState([]);
  const { fetchSpieler } = useGame();
  

  useEffect(() => {
    loadErfolge();
  }, []);

  const loadErfolge = async () => {
    try {
      const res = await api.get("/design/alleErfolge");
      setAlleErfolge(res.data.erfolge);
      setFreigeschalteteErfolge(res.data.freigeschaltet);

      // direkt sortieren
      sortiereErfolge(res.data.erfolge, res.data.freigeschaltet);
    } catch (err) {
      console.error("Fehler beim Laden der Erfolge:", err);
    }
  };

  const sortiereErfolge = (alle, frei) => {
    // Hilfsfunktion ob Erfolg freigeschaltet + ungesehen
    const istNeu = (id) => {
      const e = frei.find(x => x.erfolg_id === id);
      return e && e.gesehen === 0;
    };

    const sortiert = [...alle].sort((a, b) => {
      const aNeu = istNeu(a.id) ? 0 : 1;
      const bNeu = istNeu(b.id) ? 0 : 1;
      return aNeu - bNeu;
    });

    setSortierteErfolge(sortiert);
  };

  const hatErfolg = (id) =>
    freigeschalteteErfolge.some(e => e.erfolg_id === id);

  const istNeu = (id) => {
    const e = freigeschalteteErfolge.find(x => x.erfolg_id === id);
    return e && e.gesehen === 0;
  };

  const markAsSeen = async (id) => {
    try {
      await api.post("/design/markGesehen", { erfolgId: id });
      // local state anpassen
      setFreigeschalteteErfolge(prev => prev.map(e => 
        e.erfolg_id === id ? {...e, gesehen: 1} : e
      ));
    } catch (err) {
      console.error("Fehler beim Markieren als gesehen:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Deine Erfolge</h2>
      <div className="max-w-4xl mx-auto text-white p-6 rounded h-[50vh] overflow-y-auto">

        <div className="space-y-4">
          {sortierteErfolge.map(erfolg => {
            const freigeschaltet = hatErfolg(erfolg.id);
            const neu = istNeu(erfolg.id);

            return (
              <div 
                key={erfolg.id}
                className="flex items-center gap-6 border-b border-white/20 pb-4 relative"
                onMouseEnter={() => {
                  if (neu) markAsSeen(erfolg.id);
                }}
              >
                {/* NEU Badge */}
                {neu && (
                  <div className="absolute rotate-340 right-45 -top-4 animate-pulse text-red-500 font-bold text-xl">
                    NEU
                  </div>
                )}

                {/* Textspalte */}
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {freigeschaltet ? erfolg.bezeichnung : "?"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {freigeschaltet ? erfolg.text : ""}
                  </div>
                </div>

                {/* Belohnungen */}
                <div className="w-20 h-20 flex items-center justify-center border rounded">
                  {freigeschaltet ? (
                    <img src={`/${erfolg.bild1}`} alt="BG" className="w-full h-full object-cover rounded"/>
                  ) : (
                    <span className="text-3xl text-gray-600">?</span>
                  )}
                </div>
                <div className="w-20 h-20 flex items-center justify-center border rounded">
                  {freigeschaltet ? (
                    <img src={`/${erfolg.bild2}`} alt="Frame" className="w-full h-full object-cover rounded"/>
                  ) : (
                    <span className="text-3xl text-gray-600">?</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      <div className="text-center mt-6">
        <button
         onClick={() => {
                fetchSpieler();
                onClose();
              }}
         className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded cursor-pointer transform transition hover:scale-90">
          Schließen
        </button>
      </div>
    </div>
  );
}
