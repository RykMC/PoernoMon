import { useEffect, useState } from "react";
import api from "../api/axios";


export default function NachrichtenModal({ onClose}) {
  const [nachrichten, setNachrichten] = useState([]);
  const [ausgewaehlt, setAusgewaehlt] = useState(null);

  useEffect(() => {
    const fetchNachrichten = async () => {
      try {
        const res = await api.get("/nachrichten"); // bestehender Endpunkt
        setNachrichten(res.data);
        console.log(res.data);
      } catch (err) {
        console.error("Fehler beim Laden der Nachrichten:", err);
      }
    };
    fetchNachrichten();
  }, []);

    const handleSelectNachricht = async (nachricht) => {
    try {
        const res = await api.get(`/nachrichten/${nachricht.id}`);
        setAusgewaehlt(res.data); // enthält auch text
    } catch (err) {
        console.error("Fehler beim Laden der Nachricht:", err);
    }
    };

    const handleDelete = async (id) => {
    try {
      await api.delete(`/nachrichten/${id}`);
      const neu = nachrichten.filter(n => n.id !== id);
      setNachrichten(neu);
      setAusgewaehlt(neu[0] || null);
    } catch (err) {
      console.error("Löschen fehlgeschlagen:", err);
    }
  };

  return (
    <div>
    <div className="flex w-full max-w-5xl h-[500px] text-white">
      {/* Linke Seite: Liste */}
      <div className="w-1/3 border-r border-white/20 overflow-y-auto pr-2 ">
        {nachrichten.map(nachricht => (
          <div
            key={nachricht.id}
            onClick={() => handleSelectNachricht(nachricht)}
            className={`p-3 cursor-pointer rounded hover:bg-white/10 ${ausgewaehlt?.id === nachricht.id ? "bg-white/10" : ""}`}
          >
            <div className="font-semibold">{nachricht.betreff}</div>
          </div>
        ))}
      </div>

      {/* Rechte Seite: Inhalt */}
      <div className="w-2/3 p-4">
        {ausgewaehlt ? (
          <>
            <h3 className="text-xl font-bold mb-2">{ausgewaehlt.betreff}</h3>
            <p className="text-sm text-gray-400 mb-4">{new Date(ausgewaehlt.datum).toLocaleString()}</p>
            <p className="mb-6">{ausgewaehlt.text}</p>
            <button
              onClick={() => handleDelete(ausgewaehlt.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Nachricht löschen
            </button>
          </>
        ) : (
          <p className="text-gray-400">Keine Nachricht ausgewählt.</p>
        )}
      </div>
     
    </div>
        <div className="text-center mt-6">
            <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
            Schließen
            </button>
        </div>
    </div>
    
  );
}