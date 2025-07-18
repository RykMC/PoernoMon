import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import Lottie from "lottie-react";

export default function Kampfseite() {
  const { kampfId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchSpieler } = useGame();

  const [kampfverlauf, setKampfverlauf] = useState([]);
  const [index, setIndex] = useState(0);
  const [spieler1, setSpieler1] = useState(null);
  const [spieler2, setSpieler2] = useState(null);
  const [leben1, setLeben1] = useState(null);
  const [leben2, setLeben2] = useState(null);
  const [belohnungG, setBelohnungG] = useState(location.state?.belohnungGewinner || null);
  const [belohnungV, setBelohnungV] = useState(location.state?.belohnungVerlierer || null);
  const [floatingDamage1, setFloatingDamage1] = useState([]);
  const [floatingDamage2, setFloatingDamage2] = useState([]);
  const [bloodAnimation, setBloodAnimation] = useState(null);
  const [showBlood1, setShowBlood1] = useState(false);
  const [showBlood2, setShowBlood2] = useState(false);
  const [championKampf, setChampionKampf] = useState(false);

  const [gewinnerId, setGewinnerId] = useState(location.state?.gewinnerId || null);

  const logRef = useRef(null);
  const [introStage, setIntroStage] = useState("start");

  const rarityClass = (seltenheit) => {
    switch (seltenheit) {
      case 'legendär':
        return "border-yellow-400 border-double border-7 shadow-yellow-500/50";
      case 'selten':
        return "border-blue-300 border-double border-4 shadow-blue-500/50";
      default:
        return "border-gray-600 border-2";
    }
  };

  useEffect(() => {
    
    // nur starten wenn Spieler geladen
    if (spieler1 && spieler2) {
      if (spieler1.champion === 1 || spieler2.champion === 1) {
      setTimeout(() => setChampionKampf(true), 3000); // taucht später auf
    }
      setTimeout(() => setIntroStage("playerIn"), 1000);
      setTimeout(() => setIntroStage("vs"), 2000);
      setTimeout(() => setIntroStage("enemyIn"), 2500);
      setTimeout(() => setIntroStage("moveToFight"), 5000);
      setTimeout(() => setIntroStage("arena"), 6000);
      setTimeout(() => setIntroStage("fight"), 7000);
    }
  }, [spieler1, spieler2]);


  useEffect(() => {
    if (location.state) {
      setBelohnungG(location.state.belohnungGewinner);
      setBelohnungV(location.state.belohnungVerlierer);
      setGewinnerId(location.state.gewinnerId);
    }
  }, [location.state]);


  useEffect(() => {
    const fetchKampf = async () => {
      try {
        const res = await api.get(`/fight/log/${kampfId}`);
        setKampfverlauf(res.data.verlauf);
        setSpieler1(res.data.spieler1);
        setSpieler2(res.data.spieler2);
        console.log(res.data.verlauf);
        if (res.data.spieler1 && res.data.spieler2) {
          setLeben1(res.data.spieler1.leben);
          setLeben2(res.data.spieler2.leben);
        }
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    };
    fetchKampf();
  }, [kampfId]);

  useEffect(() => {
    if (introStage !== "fight") return;
    if (kampfverlauf.length > 0 && spieler1 && spieler2) {
      if (index > 0 && index <= kampfverlauf.length) {
        const aktuellerEintrag = kampfverlauf[index - 1];

        if (aktuellerEintrag && aktuellerEintrag.schaden > 0) {
          if (aktuellerEintrag.verteidiger_id === spieler1.user_id) {
            setFloatingDamage1(prev => [...prev, aktuellerEintrag.schaden]);
            setTimeout(() => {
              setFloatingDamage1(prev => prev.slice(1));
            }, 1000);
          } else if (aktuellerEintrag.verteidiger_id === spieler2.user_id) {
            setFloatingDamage2(prev => [...prev, aktuellerEintrag.schaden]);
            setTimeout(() => {
              setFloatingDamage2(prev => prev.slice(1));
            }, 1000);
          }
        }

        if (aktuellerEintrag.angreifer_id === spieler1.user_id) {
          setLeben1(aktuellerEintrag.leben_angreifer_nachher);
        }
        if (aktuellerEintrag.verteidiger_id === spieler1.user_id) {
          setLeben1(aktuellerEintrag.leben_verteidiger_nachher);
        }
        if (aktuellerEintrag.angreifer_id === spieler2.user_id) {
          setLeben2(aktuellerEintrag.leben_angreifer_nachher);
        }
        if (aktuellerEintrag.verteidiger_id === spieler2.user_id) {
          setLeben2(aktuellerEintrag.leben_verteidiger_nachher);
        }

      } else if (index === 0) {
        setLeben1(spieler1.leben);
        setLeben2(spieler2.leben);
      }
    }

    if (kampfverlauf.length > 0 && spieler1 && spieler2 && index < kampfverlauf.length) {
    const timeout = setTimeout(() => {
      setIndex(index + 1);
    }, 1500);
    return () => clearTimeout(timeout);
  }
  }, [index, kampfverlauf, introStage]);

  useEffect(() => {
  if (logRef.current) {
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }
}, [index]);

useEffect(() => {
  if (index >= kampfverlauf.length && gewinnerId) {
    if (spieler1 && spieler2) {
      if (gewinnerId === spieler1.user_id) {
        setShowBlood2(true); // Spieler2 hat verloren
      } else {
        setShowBlood1(true); // Spieler1 hat verloren
      }
    }
  }
}, [index, kampfverlauf.length, gewinnerId, spieler1, spieler2]);

useEffect(() => {
  fetch("/images/global/blood.json")
    .then(response => response.json())
    .then(data => setBloodAnimation(data));
}, []);


  const lebenBalken = (leben, max) => {
    if (max === 0 || max === undefined || leben === null) {
      return (
        <div className="w-full h-4 bg-gray-700 rounded-full mt-2">
          <div className="h-full bg-red-500 rounded-full" style={{ width: `0%` }}></div>
        </div>
      );
    }
    const widthPercentage = (leben / max) * 100;
    return (
      <div className="w-full h-4 bg-gray-700 rounded-full mt-2">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center  text-white p-6 flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url("/images/global/bgkampf.png")`
      }}
    >
      
      <h1 className="text-3xl font-bold mb-6">⚔️ Kampf</h1>   


      {introStage !== "fight" && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
          {/* Spieler1 */}
         <div 
          className={`absolute flex flex-col items-center transition-all duration-700
            ${introStage === "playerIn" ? "left-150 scale-[2]"
            : introStage === "vs" ? "left-150 scale-[2]"
            : introStage === "enemyIn" ? "left-150 scale-[2]"
            : (introStage === "moveToFight" || introStage === "arena" || introStage === "fight") ? "left-1/4 scale-100"
            : "-left-1/2 scale-100"}`}
        >
          <img src={`/${spieler1?.bild}`} className="w-50 h-50 object-contain" />
          <h2 className="text-lg font-bold text-white mt-2">{spieler1?.name}</h2>
        </div>

          {/* Gegner */}
          <div 
            className={`absolute flex flex-col items-center transition-all duration-700
              ${introStage === "enemyIn" ? "right-150 scale-[2]"
              : (introStage === "moveToFight" || introStage === "arena" || introStage === "fight") ? "right-1/4 scale-100"
              : "-right-1/2 scale-100"}`}
          >
            <img src={`/${spieler2?.bild}`} className="w-50 h-50 object-contain" />
            <h2 className="text-lg font-bold text-white mt-2">{spieler2?.name}</h2>
          </div>


          {/* VS */}
         {(introStage === "vs" || introStage === "moveToFight"  || introStage === "enemyIn") && (
            <img src="/images/global/vs.png" className="w-32 h-32 object-contain animate-bounce z-50"/>
          )}

          {/* ChampionKampf */}
          {championKampf && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50">
              <img
                src="/images/global/ck.png"
                alt="Championkampf"
                className="w-80 h-auto animate-pulse"
              />
            </div>
          )}

          {/* Arena */}
          {introStage === "arena" && (
            <img src="/images/global/bgkampf.png" className="absolute inset-0 w-full h-full object-cover animate-fadeIn" />
          )}
        </div>
      )}


    {introStage === "fight" && (
      <div className="flex justify-between w-full max-w-6xl">



        {/* Spieler 1 */}
        <div className="bg-gray-800 rounded-xl p-4 w-1/4 text-center">
          <h2 className="text-lg font-bold">{spieler1?.name}</h2>
          <div className="relative w-50 h-50 mx-auto my-4">
            {floatingDamage1.map((dmg, idx) => (
              <div key={idx} className="absolute top-60 left-[8em] transform -translate-x-1/2 text-red-500 font-extrabold text-4xl animate-float z-20">
                -{dmg}
              </div>
            ))}
            {spieler1?.background && (
              <img src={`/${spieler1?.background}`} alt="Background" className="absolute w-full h-full object-contain" />
            )}
            <img src={`/${spieler1?.bild}`} alt="Kreatur" className="absolute w-full h-full object-contain" />
            {spieler1?.frame && (
              <img src={`/${spieler1?.frame}`} alt="Frame" className="absolute w-full h-full object-contain" />
            )}
            {showBlood1 && bloodAnimation && (
              <div className="absolute w-full h-full flex items-center justify-center">
                <Lottie animationData={bloodAnimation} loop={false} style={{ width: "100%", height: "100%" }} />
              </div>
            )}
          </div>
          {spieler1 && leben1 !== null && spieler1.leben !== undefined && index > 0 && (
            <>
              {lebenBalken(leben1, spieler1.max_leben)}
              <p className="text-sm text-gray-300 mt-1">❤️ {leben1} / {spieler1.max_leben}</p>
            </>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["waffe", "kopfschutz", "brustschutz", "beinschutz"].map((slot) => {
              const item = spieler1?.items?.find(it => it.typ === slot);
              return (
                <div 
                  key={slot}
                  className={`p-1 rounded border-2 ${rarityClass(item?.seltenheit)} bg-gray-700 w-20 h-20`}
                >
                  {item?.bild ? (
                    <img 
                      src={`/${item.bild}`} 
                      alt={slot}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {slot}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kampfverlauf */}
        <div ref={logRef} className="w-1/2 bg-gray-900 rounded-xl p-6 mx-4 h-130 overflow-y-auto whitespace-pre-line shadow-lg border border-yellow-500">
          {kampfverlauf.slice(0, index).map((eintrag, i) => (
            <div key={i} className="mb-2">
              <p className="text-yellow-300">{eintrag.kommentar}</p>
            </div>
          ))}
          
          
          {index >= kampfverlauf.length && belohnungG && spieler1 && gewinnerId === spieler1.user_id && (
            <div className="mt-4 text-green-400">
              <p>✅ Du hast gewonnen!</p>
              <p>⭐ XP: {belohnungG.xp}</p>
              <p>🌀 Kampfstaub: {belohnungG.staub}</p>
              <p>💰 Coins: {belohnungG.coins}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400"
              >
                Zurück zum Dashboard
              </button>
            </div>
          )}

          {index >= kampfverlauf.length && belohnungV && spieler1 && gewinnerId !== spieler1.user_id && (
            <div className="mt-4 text-red-400">
              <p>❌ Du hast verloren!</p>
              <p>⭐ XP: {belohnungV.xp}</p>
              <p>🌀 Kampfstaub: {belohnungV.staub}</p>
              <p>💰 Coins: {belohnungV.coins}</p>
              <button
                onClick={() => {fetchSpieler(); navigate("/dashboard"); }}
                className="mt-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400"
              >
                Zurück zum Dashboard
              </button>
            </div>
          )}

        </div>

        {/* Spieler 2 */}
        <div className="bg-gray-800 rounded-xl p-4 w-1/4 text-center h-130">
          <h2 className="text-lg font-bold">{spieler2?.name}</h2>
          <div className="relative w-50 h-50 mx-auto my-4">
            {floatingDamage2.map((dmg, idx) => (
              <div key={idx}  className="absolute top-60 right-[6em] transform -translate-x-1/2 text-red-500 font-extrabold text-4xl animate-float z-20">
                -{dmg}
              </div>
            ))}
            {spieler2?.background && (
              <img src={`/${spieler2?.background}`} alt="Background" className="absolute w-full h-full object-contain" />
            )}
            <img src={`/${spieler2?.bild}`} alt="Kreatur" className="absolute w-full h-full object-contain" />
            {spieler2?.frame && (
              <img src={`/${spieler2?.frame}`} alt="Frame" className="absolute w-full h-full object-contain" />
            )}
            {showBlood2 && bloodAnimation && (
              <div className="absolute w-full h-full flex items-center justify-center">
                <Lottie animationData={bloodAnimation} loop={false} style={{ width: "100%", height: "100%" }} />
              </div>
            )}
          </div>
          {spieler2 && leben2 !== null && spieler2.leben !== undefined && index > 0 && (
            <>
              {lebenBalken(leben2, spieler2.max_leben)}
              <p className="text-sm text-gray-300 mt-1">❤️ {leben2} / {spieler2.max_leben}</p>
            </>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["waffe", "kopfschutz", "brustschutz", "beinschutz"].map((slot) => {
              const item = spieler2?.items?.find(it => it.typ === slot);
              return (
                <div 
                  key={slot}
                  className={`p-1 rounded border-2 ${rarityClass(item?.seltenheit)} bg-gray-700  w-20 h-20`}
                >
                  {item?.bild ? (
                    <img 
                      src={`/${item.bild}`} 
                      alt={slot}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      {slot}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
)}
    </div>
  );
}
