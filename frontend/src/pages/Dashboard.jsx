import { useEffect, useState } from "react";
import api from "../api/axios";
import PoernoMonModal from "../components/PoernoMonModal";
import StatistikModal from "../components/StatistikModal";
import NachrichtenModal from "../components/nachrichtenModal";
import ItemModal from "../components/itemModal";
import ShopModal from "../components/shopModal";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useGame } from "../context/GameContext";




export default function Dashboard() {
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmFight, setConfirmFight] = useState(false);
  const navigate = useNavigate();
  const [loadingFight, setLoadingFight] = useState(false);
  const { spieler, ungeleseneNachrichten, fetchSpieler, fetchNachrichten  } = useGame();




  
  const fetchData = async () => {
    try {
      const res = await fetchSpieler(true); // true liefert den response zurück
      const aktuellerSpieler = res?.spieler || spieler;

      // Username prüfen (null, leerstring, leerzeichen)
      if (!aktuellerSpieler?.username || aktuellerSpieler.username.trim() === "") {
        setModalContent(
          <IntroWithName
            image={aktuellerSpieler.kreatur_bild}
            onDone={async () => {
              setShowModal(false);
              await fetchSpieler(); // direkt neu laden damit Username da ist
            }}
          />
        );
        setShowModal(true);
      }
    } catch (err) {
      console.error("Fehler beim Laden:", err);
      alert("Fehler beim Laden der Spielerdaten – bist du eingeloggt?");
    }
  };

    useEffect(() =>  {
      fetchData();
      fetchNachrichten();
    }, []);

  

  const handleFightStart = async () => {
    try {
      setLoadingFight(true);
      setConfirmFight(true);
      const res = await api.post("/fight/matchmaking");
      console.log(res.data);
      navigate(`/fight/${res.data.kampfId}`, {
        state: {
          belohnungGewinner: res.data.belohnungGewinner,
          belohnungVerlierer: res.data.belohnungVerlierer,
          gewinnerId: res.data.gewinnerId
        }
      });
    } catch (err) {
      console.error("Fehler beim Matchmaking:", err);
      alert("Kein passender Gegner gefunden oder Fehler beim Starten");
    } finally {
      setLoadingFight(false);
    }
  };

  function IntroWithName({ image, onDone }) {
    const [username, setUsername] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [step, setStep] = useState(0);
    const texte = [
      "Hier kommt dein PoernoMon!!!",
      "Freundet euch an...",
      "Ihr werdet spannende Zeiten erleben...",
    ];

    useEffect(() => {
      if (step < texte.length) {
        const timer = setTimeout(() => setStep(step + 1), 2000);
        return () => clearTimeout(timer);
      }
    }, [step]);

    const handleSubmit = async () => {
      if (username.length < 3) return alert("Name zu kurz!");
      try {
        await api.post("/auth/set-username", { username });
        setSubmitted(true);
        setTimeout(onDone, 1000);
      } catch (err) {
        alert(err.response?.data?.error || "Fehler beim Speichern");
      }
    };

    return (
      <div className="text-center text-white p-6 max-w-md mx-auto">
        <div className="mb-6">
          <img
            src={`/${image}`}
            alt="Poernomon"
            className={`mx-auto w-52 h-52 transform transition duration-1000 ${
              step >= 2 ? "scale-100 opacity-100" : "scale-0 opacity-0"
            } drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]`}
          />
        </div>
        {texte.slice(0, step).map((t, i) => (
          <p key={i} className="mb-2 text-lg">{t}</p>
        ))}
        {step >= texte.length && !submitted && (
          <div className="mt-6 space-y-3">
            <p>Wie möchtest du dein PoernoMon nennen?</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded text-white bg-gray-700"
              placeholder="Name eingeben..."
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded shadow"
            >
              Bestätigen
            </button>
          </div>
        )}
        {submitted && <p className="mt-4 text-green-400">Willkommen, {username}!</p>}
      </div>
    );
  }
  if (!spieler) return <div className="p-6 text-white">Lade Spieler...</div>;

  return (
    <div className="h-screen bg-cover bg-center bg-no-repeat text-white relative overflow-hidden"
     style={{ backgroundImage: `url("/images/global/bgdashboard.png")` }}>
    <header className="flex justify-between items-center gap-8 px-8 py-4 bg-black/70 shadow-lg text-white text-base">
      {/* Linke Seite: Logo */}
      <img
        src="/images/global/logo.png"
        alt="Logo"
        className="h-14 w-auto drop-shadow-lg"
      />

      {/* Rechte Seite: Status und Buttons */}
      <div className="flex items-center gap-6 text-lg">
        <div className="flex items-center gap-2">
          <img src="/images/global/level.png" alt="Level" className="h-6 w-6" />
          <span className="font-semibold">{spieler.level}</span>
        </div>
         <div className="flex items-center gap-2">
          <img src="/images/global/coins.png" alt="Coins" className="h-6 w-6" />
          <span className="font-semibold">{spieler.coins}</span>
        </div>
        <div className="flex items-center gap-2">
          <img src="/images/global/kampfstaub.png" alt="Kampfstaub" className="h-6 w-6" />
          <span className="font-semibold">{spieler.kampfstaub}</span>
        </div>
<div className="relative">
 <button
  onClick={() => {
    setModalContent(
      <NachrichtenModal
        onClose={async () => {
          setShowModal(false);
          await fetchNachrichten();
        }}
      />
    );
    setShowModal(true);
  }}
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-8 h-8 text-white"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth={2}
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m0 8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8z"
  />
</svg>
{ungeleseneNachrichten > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
    {ungeleseneNachrichten}
  </span>
)}
</button>
</div>

    <button
      onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/";
      }}
      className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all text-sm shadow-md"
    >
      🚪 Logout
    </button>
  </div>
</header>

      <PoernoMonModal
        setModalContent={setModalContent}
        setShowModal={setShowModal}
      />

      <main className="flex justify-center items-center min-h-[60vh]">
         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-[2vw]">
          {/* <button onClick={() => openModal(<PoernoMonModal onClose={() => setShowModal(false)} setModalContent={setModalContent} />)}>
            <img src="/images/global/kachel1.png" alt="Dein PoernoMon" className="w-[14vw] max-w-[180px] min-w-[100px] hover:scale-105 transition-transform" />
          </button> */}
          <button
            onClick={() => {
              setModalContent(<StatistikModal onClose={() => setShowModal(false)} />);
              setShowModal(true);
            }}
          >
            <img
              src="/images/global/kachel2.png"
              alt="Statistik & Ranking"
              className="w-[14vw] max-w-[180px] min-w-[100px] hover:scale-105 transition-transform"
            />
          </button>
          <button
            onClick={() => {
              setModalContent(<ItemModal onClose={() => setShowModal(false)} />);
              setShowModal(true);
            }}
          >
            <img src="/images/global/kachel3.png" alt="Ausrüstung" className="w-[14vw] max-w-[180px] min-w-[100px] hover:scale-105 transition-transform" />
          </button>
          <button 
          onClick={() => {
              setModalContent(<ShopModal onClose={() => setShowModal(false)} />);
              setShowModal(true);
            }}
          >
            <img src="/images/global/kachel4.png" alt="Shop" className="w-[14vw] max-w-[180px] min-w-[100px] hover:scale-105 transition-transform" />
          </button>
        </div>

      </main>
<button
  onClick={() => setConfirmFight(true)}
  disabled={spieler.leben < 30}
  className="absolute bottom-30 right-30 w-[150px] h-[150px] transition-transform hover:scale-125 disabled:opacity-50"
>
  <img
    src="/images/global/fight.png"
    alt="Fight"
    className="w-full h-full object-contain"
  />
</button>

  {confirmFight && (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center relative">
        {loadingFight ? (
          <Loader />
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-gray-100 drop-shadow">
              Bereit für den Kampf?
            </h2>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => setConfirmFight(false)}
                className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 transition-all shadow hover:shadow-lg"
              >
                ❌ Nein
              </button>
              <button
                onClick={handleFightStart}
                className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition-all shadow hover:shadow-green-500/50"
              >
                ✅ Ja
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )}


    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-gray-900 p-6 rounded-2xl shadow-2xl w-[130vh]  mx-4 relative
                        h-[70vh]">
          {modalContent}
        </div>
      </div>
    )}

    </div>
  );
}

