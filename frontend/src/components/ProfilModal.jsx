import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ProfilModal({ onClose }) {
  const [spieler, setSpieler] = useState(null);
  const [frames, setFrames] = useState([]);
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);




  useEffect(() => {
    const loadDesigns = async () => {
      try {
        const res = await api.get("/design/my-designs");
        setFrames(res.data.frames);
        setBackgrounds(res.data.backgrounds);
      } catch (err) {
        console.error(err);
      }
    };
    loadDesigns();
  }, []);

    useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/auth/me");
        setSpieler(res.data.spieler);
        setSelectedFrame(res.data.spieler.frame_bild || null);
        setSelectedBackground(res.data.spieler.background_bild|| null);
       console.log("das: ", res.data.spieler);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
        alert("Fehler beim Laden der Spielerdaten – bist du eingeloggt?");
      }
    };


    
    fetchData();
  }, []);



  const handleSelect = async (type, id, bild) => {
    try {
      console.log(type, id, bild);
      await api.post("/design/select", { type, designId: id });

      if (type === "frame") {
        setSelectedFrame(bild);
      } else {
        setSelectedBackground(bild);
      }
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
    }
  };


if (!spieler) return <p className="text-white ">Lade Spielerdaten...</p>;
  return (
    <div>
    <div className="text-white h-130 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">🎨 Profil bearbeiten</h2>

      {/* Vorschau */}
      <div className="relative w-[250px] h-[250px] mx-auto mb-6 ">
        {selectedBackground && (
          <img
            src={`/${selectedBackground}`}
            alt="Hintergrund"
            className="absolute w-full h-full"
          />
        )}
        <img
          src={`/${spieler.kreatur_bild}`} // oder dynamisch falls speicherbar
          alt="Kreatur"
          className="absolute w-full h-full"
        />
        {selectedFrame && (
          <img
            src={`/${selectedFrame}`}
            alt="Rahmen"
            className="absolute w-full h-full"
          />
        )}
      </div>

      {/* Auswahl */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
        <h3 className="font-bold mb-2">🖼 Hintergrund wählen</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {backgrounds.map(bg => (
            <img
              key={bg.id}
              src={`/${bg.bild}`}
              alt={bg.name}
              onClick={() => handleSelect("background", bg.id, bg.bild)}
              className={`w-20 h-20 cursor-pointer rounded border-2 ${
                selectedBackground === bg.bild ? "border-yellow-400" : "border-transparent"
              }`}
            />
          ))}
        </div>

      </div>

      <div className="mb-6">
         <div className="flex flex-wrap gap-2 justify-center">
         <h3 className="font-bold mb-2">🧱 Rahmen wählen</h3>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          
          {frames.map(frame => (
            <img
              key={frame.id}
              src={`/${frame.bild}`}
              alt={frame.name}
              onClick={() => handleSelect("frame", frame.id, frame.bild)}
              className={`w-20 h-20 cursor-pointer rounded border-2 ${
                selectedFrame === frame.bild ? "border-yellow-400" : "border-transparent"
              }`}
            />
          ))}
        </div>
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
