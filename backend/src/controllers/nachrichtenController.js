import pool from '../db/db.js';

// Gibt die Anzahl ungelesener Nachrichten zurück
export async function getUngeleseneNachrichten(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT COUNT(*) FROM nachrichten
      WHERE an_id = $1 AND gelesen = false
    `, [userId]);

    const anzahl = parseInt(result.rows[0].count, 10);
    res.json({ ungelesen: anzahl });
  } catch (err) {
    console.error("Fehler bei getUngeleseneNachrichten:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}



export async function getAlleNachrichten(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT id, betreff, gelesen, datum, text
      FROM nachrichten
      WHERE an_id = $1
      ORDER BY datum DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Fehler bei getAlleNachrichten:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}

export async function getNachrichtById(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await pool.query(`
      SELECT * FROM nachrichten
      WHERE id = $1 AND an_id = $2
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nachricht nicht gefunden" });
    }

    // Als gelesen markieren
    await pool.query(`
      UPDATE nachrichten SET gelesen = true WHERE id = $1
    `, [id]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fehler bei getNachrichtById:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}

export async function deleteNachricht(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM nachrichten
      WHERE id = $1 AND an_id = $2
      RETURNING *
    `, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Nachricht nicht gefunden oder keine Berechtigung" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler bei deleteNachricht:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}



