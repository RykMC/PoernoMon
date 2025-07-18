import api from "../api/axios";
import { useEffect } from "react";
import ProfilModal from "./ProfilModal";
import { useGame } from "../context/GameContext";

export default function PoernoMonModal({ setModalContent, setShowModal, addConsoleMessage }) {
  const { poernomon, fetchPoernomon, fetchSpieler } = useGame();

  const rarityStyles = (seltenheit) => {
    switch (seltenheit) {
      case 'legendär':
        return {
          border: "border-yellow-400 border-4",
          bg: "bg-yellow-400/50",
          shadow: "shadow-yellow-500/50"
        };
      case 'selten':
        return {
          border: "border-blue-300 border-2",
          bg: "bg-blue-300/50",
          shadow: "shadow-blue-500/40"
        };
        
      default:
        return {
          border: "border-gray-600",
          bg: "bg-gray-600/50",
          shadow: "shadow-gray-500/30"
        };
    }
  };


   useEffect(() => {
    fetchPoernomon();
  }, []);
 
  const handleSkill = async (key) => {
    try {
      console.log(key);
      await api.post("/poernomon/skill", { eigenschaft: key });
      await fetchPoernomon(); 
      await fetchSpieler();
    } catch (err) {
      console.error("Skillpunkt konnte nicht vergeben werden", err);
    }
  };

  const handleEquip = async (slot, itemId) => {
    try {
      const row = await api.post("/items/equip", { slot, itemId: itemId || null });
      await fetchPoernomon();
      console.log("Daten ", row.data);
      addConsoleMessage(row.data.message);
    } catch (err) {
      console.error("Fehler beim Ausrüsten:", err);
    }
  };

  if (!poernomon) return <div className="text-white">Lade Poernomon...</div>;

  const eigenschaftenSpalten = [
    [
      { label: "Angriff", key: "angriff", value: poernomon.eigenschaften.angriff, tooltip: "Erhöht deinen Angriffswurf" },
      { label: "Doppelschlag", key: "doppelschlag", value: poernomon.eigenschaften.doppelschlag, tooltip: "Chance auf einen zweiten Angriff" },
      { label: "krit. Chance", key: "krit_chance", value: poernomon.eigenschaften.krit_chance, tooltip: "Chance auf kritischen Treffer" },
      { label: "krit. Schaden", key: "krit_schaden", value: poernomon.eigenschaften.krit_schaden, tooltip: "Zusätzlicher Schaden bei kritischen Treffern" },
    ],
    [
      { label: "Verteidigung", key: "verteidigen", value: poernomon.eigenschaften.verteidigen, tooltip: "Reduziert gegnerischen Schaden" },
      { label: "Ausweichen", key: "ausweichen", value: poernomon.eigenschaften.ausweichen, tooltip: "Chance Angriffen komplett zu entgehen" },
      { label: "Leben / Treffer", key: "leben_pro_treffer", value: poernomon.eigenschaften.leben_pro_treffer, tooltip: "Chance auf Heilung nach Treffer" },
      { label: "max. Gesundheit", key: "max_leben", value: poernomon.eigenschaften.max_leben, tooltip: "Maximale Lebenspunkte" },
    ],
    [
      { label: "Glück", key: "gluck", value: poernomon.eigenschaften.gluck, tooltip: "Manchmal gehört auch etwas Glück dazu" },
      { label: "XP-Sammler", key: "mehr_xp", value: poernomon.eigenschaften.mehr_xp, tooltip: "Bonus auf gewonnene XP" },
      { label: "Staubsammler", key: "mehr_kampfstaub", value: poernomon.eigenschaften.mehr_kampfstaub, tooltip: "Mehr Kampfstaub aus Kämpfen" },
      { label: "Coins-Sammler", key: "mehr_coins", value: poernomon.eigenschaften.mehr_coins, tooltip: "Erhöht erhaltene Coins" },
    ]
  ];

  const itemEigenschaftLabels = {
    angriff: "Angriff",
    doppelschlag: "Doppelschlag",
    krit_chance: "krit. Chance",
    krit_schaden: "krit. Schaden",
    verteidigen: "Verteidigung",
    ausweichen: "Ausweichen",
    leben_pro_treffer: "Leben / Treffer",
    max_leben: "max. Gesundheit",
    gluck: "Glück",
    mehr_xp: "XP-Sammler",
    mehr_kampfstaub: "Staubsammler",
    mehr_coins: "Coins-Sammler"
  };


  return (
    <div className="w-full max-w-8xl mx-auto px-4 mt-6">
      <div className=" text-white rounded-2xl shadow-lg p-8 relative">

        <h2 className="text-3xl font-bold text-center mb-6">Dein PoernoMon</h2>

        <div className="w-[80%] grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 mx-auto">
          {/* Linke Seite */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-2 text-center">{poernomon.name}</h3>
            {poernomon.skillpunkte > 0 ? (
              <p className="text-center text-yellow-400 text-sm mb-2">
                Verfügbare Skillpunkte: {poernomon.skillpunkte}
              </p>
            ) : (
              <p className="text-center text-green-400 text-sm mb-2">
                Level: {poernomon.level}
              </p>
            )}
            
              <div className="flex items-center justify-center gap-6 mb-6">
                {/* Kreaturenbild */}
                <div
                  className="relative w-[150px] h-[150px] cursor-pointer hover:scale-105 transition"
                  onClick={() => {
                    setModalContent(
                      <ProfilModal
                        onClose={() => {
                          setShowModal(false);        // Modal schließen
                          fetchPoernomon();           // neu laden nach Close
                        }}
                      />
                    );
                    setShowModal(true);
                  }}
                >
                  {poernomon.champion === 1 && (
                    <img
                      src="/images/global/champion.png"
                      alt="Champion Badge"
                      className="absolute top-[5px] left-[-40px] transform rotate-330 z-10"
                    />
                  )}
                  {poernomon.background_bild && (
                    <img
                      src={`/${poernomon.background_bild}`}
                      alt="Hintergrund"
                      className="absolute w-full h-full"
                    />
                  )}
                  <img
                    src={`/${poernomon.kreatur_bild}`}
                    alt="Kreatur"
                    className="absolute w-full h-full"
                  />
                  {poernomon.frame_bild && (
                    <img
                      src={`/${poernomon.frame_bild}`}
                      alt="Rahmen"
                      className="absolute w-full h-full"
                    />
                  )}
                </div>

                {/* Balken nebeneinander */}
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Aktuelles Leben</div>
                    <div className="w-full h-4 bg-gray-700 rounded-full relative">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${(poernomon.leben / poernomon.eigenschaften.max_leben) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 text-center text-xs font-semibold text-white">
                        {poernomon.leben} / {poernomon.eigenschaften.max_leben}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Erfahrung</div>
                    <div className="w-full h-4 bg-gray-700 rounded-full relative">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(poernomon.xp / poernomon.xpNaechstesLevel) * 100}%` }}
                      ></div>
                      <div className="absolute inset-0 text-center text-xs font-semibold text-black">
                        {poernomon.xp} / {poernomon.xpNaechstesLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                {eigenschaftenSpalten.map((spalte, spaltenIndex) => (
                  <div key={spaltenIndex} className="flex flex-col gap-2">
                    {spalte.map((e) => (
                      <div key={e.key} className="relative group flex justify-between items-center gap-2">
                        <span className="text-gray-400 w-32">{e.label}:</span>
                        <span className="font-semibold text-white">{e.value}</span>
                        {poernomon.skillpunkte > 0 && (
                          <button
                            onClick={() => handleSkill(e.key)}
                            className="text-green-400 hover:text-green-300 font-bold cursor-pointer hover:scale-125  duration-60 ease-in-out animate-bounce"
                            title={`+1 auf ${e.label}`}
                          >
                            ＋
                          </button>
                        )}
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2
                                        bg-black text-white text-xs px-2 py-1 rounded opacity-0
                                        group-hover:opacity-100 transition pointer-events-none z-50 whitespace-nowrap">
                          {e.tooltip}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

          </div>

          {/* Rechte Seite */}
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-4 text-center">Ausrüstung</h3>

            {/* Dropdowns nebeneinander */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 w-190">
              {["waffe", "kopfschutz", "brustschutz", "beinschutz"].map(slot => {
                const item = poernomon.items.find(i => i.typ === slot && i.angelegt === 1);
                const style = item ? rarityStyles(item.seltenheit) : {
                  bg: "bg-gray-700",
                  border: "border-gray-600",
                  shadow: "shadow-inner"
                };
                return (
                  <div key={slot} className="flex flex-col items-center gap-2">
                    {/* Dropdown separat oben */}
                    <select
                      className="w-44 bg-gray-800 text-white p-2 rounded text-xs"
                      onChange={(e) => handleEquip(slot, e.target.value)}
                      value={item?.id || ""}
                    >
                      <option key={0} value="">- {slot} -</option>
                      {poernomon.items
                        .filter(it => it.typ === slot && !it.shop)
                        .map(it => (
                          <option key={it.id} value={it.id}>
                            {it.bezeichnung}
                          </option>
                      ))}
                    </select>

                    {/* Die Card darunter */}
                    <div
                      className={`w-40 md:w-46 h-56 md:h-60 rounded-2xl p-5 text-center 
                        shadow-xl ${item ? `${style.bg} ${style.border} ${style.shadow}` : ""}`
                      }
                    >
                      {item ? (
                        <>
                          <div className="mb-2 font-semibold text-white">{item.bezeichnung}</div>
                          <img
                            src={`/${item.bild}`}
                            alt={item.bezeichnung}
                            className="w-20 h-20 object-contain mx-auto mb-4"
                          />
                          <div className="text-xs space-y-1 mb-2 text-gray-300">
                            {item.boni.map((b, idx) => (
                              <div key={idx}>+{b.wert} {itemEigenschaftLabels[b.was] || b.was}</div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs italic text-gray-400 mt-8">leer</div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>


          </div>


        </div>
      </div>
      
    </div>
  );
}