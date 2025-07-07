import { useState, useEffect } from "react";
import api from "../api/axios"; 

export default function TrainingModal({ onClose }) {
  const [selectedTraining, setSelectedTraining] = useState("");
  const [trainingActive, setTrainingActive] = useState(false);
  const [trainingPaused, setTrainingPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startzeit, setStartzeit] = useState(null);
  const [endzeit, setEndzeit] = useState(null);
  const [eigenschaft, setEigenschaft] = useState("");

  useEffect(() => {
    fetchTraining();
  }, []);

  const fetchTraining = async () => {
    try {
      const res = await api.get("/training");
      const training = res.data.training[0];
      if (training) {
        setStartzeit(training.startzeit);
        setEndzeit(training.endzeit);
        setEigenschaft(training.eigenschaft);
        setTrainingActive(training.aktiv === 1);
        setTrainingPaused(training.aktiv === 0);
      } else {
        setStartzeit(null);
        setEndzeit(null);
        setEigenschaft("");
        setTrainingActive(false);
        setTrainingPaused(false);
      }
    } catch (err) {
      console.error("Fehler beim Laden des Trainings:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (trainingActive && startzeit && endzeit) {
      interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const laufzeit = endzeit - startzeit;
        const verstrichen = now - startzeit;
        const prozent = Math.min(100, (verstrichen / laufzeit) * 100);
        setProgress(prozent);

        if (prozent >= 100) {
          clearInterval(interval);
          setTrainingActive(false);
          setProgress(100);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trainingActive, startzeit, endzeit]);

  const startTraining = async () => {
    if (!selectedTraining) return;
    try {
      await api.post("/training/start", { eigenschaft: selectedTraining });
      await fetchTraining();
    } catch (err) {
      console.error("Fehler beim Starten des Trainings:", err);
    }
  };

  const resumeTraining = async () => {
    try {
      await api.post("/training/start", { eigenschaft });
      await fetchTraining();
    } catch (err) {
      console.error("Fehler beim Wiederaufnehmen:", err);
    }
  };

  const interruptTraining = async () => {
    try {
      await api.post("/training/interrupt");
      await fetchTraining();
    } catch (err) {
      console.error("Fehler beim Unterbrechen des Trainings:", err);
    }
  };

  const remainingTime = () => {
    if (!startzeit || !endzeit) return "";
    const now = Math.floor(Date.now() / 1000);
    const sekunden = Math.max(0, endzeit - now);
    const stunden = Math.floor(sekunden / 3600);
    const minuten = Math.floor((sekunden % 3600) / 60);
    return `${stunden}h ${minuten}m`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🏋️‍♂️ Training starten</h2>
      <div className="flex flex-wrap gap-2 justify-center mt-20" style={{ minHeight: "25rem" }}>
        <div>
          {trainingActive ? (
            <>
              <div className="mb-2 text-center">Training in <b>{eigenschaft}</b> läuft</div>
              <div className="mb-2 text-center">Noch: {remainingTime()}</div>
              <button 
                onClick={interruptTraining}
                className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded m-5"
              >
                Training unterbrechen
              </button>
            </>
          ) : trainingPaused ? (
            <>
              <div className="mb-2 text-center">⏸️ Training pausiert</div>
              <div className="mb-2 text-center">Verbleibend: {remainingTime()}</div>
              <button 
                onClick={resumeTraining}
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded m-5"
              >
                Training wieder aufnehmen
              </button>
            </>
          ) : (
            <>
              <select 
                value={selectedTraining}
                onChange={(e) => setSelectedTraining(e.target.value)}
                className="bg-gray-700 p-2 rounded mb-4"
              >
                <option value="">- Eigenschaft wählen -</option>
                <option value="angriff">Angriff</option>
                <option value="verteidigung">Verteidigung</option>
                <option value="gesundheit">Gesundheit</option>
              </select>
              <div className="mb-2 text-center">Dauer: 24 Stunden</div>
              <button 
                onClick={startTraining}
                className="bg-green-600 hover:bg-green-700 p-2 rounded m-5"
                disabled={!selectedTraining}
              >
                Training starten
              </button>
            </>
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
