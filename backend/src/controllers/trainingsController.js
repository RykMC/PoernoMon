import pool from '../db/db.js';
import { validateStartTraining } from "../models/index.js";

// Aktuelles Training des Spielers abrufen
export const getTraining = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM training WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    res.json({ training: result.rows });
  } catch (err) {
    console.error("Fehler beim Laden des Trainings:", err);
    res.status(500).json({ error: "Fehler beim Laden des Trainings" });
  }
};


// Training starten oder wieder aufnehmen
export const startTraining = async (req, res) => {
  const data = validateStartTraining(req, res);
  if (!data) return;
  const { eigenschaft } = data;
  const userId = req.user.userId;

  const now = Math.floor(Date.now() / 1000); // aktueller Unix Timestamp

  try {
    // Prüfen ob schon Training existiert
    const existing = await pool.query(
      `SELECT * FROM training WHERE user_id = $1 AND eigenschaft = $2`,
      [userId, eigenschaft]
    );

    if (existing.rows.length > 0) {
      // Wiederaufnahme
      const train = existing.rows[0];
      const remaining = train.endzeit - now;

      // Falls Training schon abgelaufen ist, wieder volle 24h starten
      const rest = remaining > 0 ? remaining : 24 * 60 * 60;
      const newEndzeit = now + rest;

      await pool.query(
        `UPDATE training SET startzeit = $1, endzeit = $2, aktiv = 1 
         WHERE user_id = $3 AND eigenschaft = $4`,
        [now, newEndzeit, userId, eigenschaft]
      );

      res.json({ success: true, message: `Training in ${eigenschaft} wurde wieder aufgenommen.` });
    } else {
      // Neues Training starten
      const endzeit = now + (24 * 60 * 60);

      await pool.query(
        `INSERT INTO training (user_id, eigenschaft, startzeit, endzeit, aktiv)
         VALUES ($1, $2, $3, $4, 1)`,
        [userId, eigenschaft, now, endzeit]
      );

      res.json({ success: true, message: `Training für ${eigenschaft} gestartet.` });
    }

  } catch (err) {
    console.error("Fehler beim Starten des Trainings:", err);
    res.status(500).json({ error: "Fehler beim Starten des Trainings" });
  }
};


// Training bei Angriff unterbrechen
export const interruptTraining = async (req, res) => {
  const userId = req.user.userId;
  const now = Math.floor(Date.now() / 1000);

  try {
    const activeTrainings = await pool.query(
      `SELECT * FROM training WHERE user_id = $1 AND aktiv = 1`,
      [userId]
    );

    for (let train of activeTrainings.rows) {
      const restzeit = train.endzeit - train.startzeit;
      const newEndzeit = now + restzeit;

      await pool.query(
        `UPDATE training SET aktiv = 0, endzeit = $1 WHERE id = $2`,
        [newEndzeit, train.id]
      );
    }

    res.json({ success: true, message: "Training unterbrochen." });
  } catch (err) {
    console.error("Fehler beim Unterbrechen des Trainings:", err);
    res.status(500).json({ error: "Fehler beim Unterbrechen des Trainings" });
  }
};
