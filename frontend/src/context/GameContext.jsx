import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [spieler, setSpieler] = useState(null);
  const [poernomon, setPoernomon] = useState(null);
  const [items, setItems] = useState([]);
  const [ungeleseneNachrichten, setUngeleseneNachrichten] = useState(0);

  // Spieler laden & optional Response zurückgeben
  const fetchSpieler = async (returnData = false) => {
    try {
      const res = await api.get("/auth/me");
      setSpieler(res.data.spieler);
      return returnData ? res.data : undefined;
    } catch (err) {
      console.error("Fehler beim Laden des Spielers:", err);
    }
  };

  const fetchPoernomon = async () => {
    try {
      const res = await api.get("/poernomon");
      setPoernomon(res.data);
    } catch (err) {
      console.error("Fehler beim Laden des Poernomon:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data);
    } catch (err) {
      console.error("Fehler beim Laden der Items:", err);
    }
  };

  const fetchNachrichten = async () => {
    try {
      const res = await api.get("/nachrichten/ungelesen");
      setUngeleseneNachrichten(res.data.ungelesen);
    } catch (err) {
      console.error("Fehler beim Laden der Nachrichten:", err);
    }
  };

  useEffect(() => {
    fetchSpieler();
    fetchPoernomon();
    fetchItems();
    fetchNachrichten();
  }, []);

  return (
    <GameContext.Provider value={{
      spieler,
      poernomon,
      items,
      ungeleseneNachrichten,
      fetchSpieler,
      fetchPoernomon,
      fetchItems,
      fetchNachrichten
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
