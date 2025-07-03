import pool from '../db/db.js';

// Alle freigeschalteten Designs eines Users laden (Frames & Backgrounds getrennt)
export const getUserDesigns = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.typ, d.bild
       FROM designs_ref r
       JOIN designs d ON d.id = r.designid
       WHERE (r.userid = $1 OR r.userid = 0)`,
      [userId]
    );

    const rows = result.rows;
    console.log(result.rows);
    const frames = rows.filter(d => d.typ === "frame");
    const backgrounds = rows.filter(d => d.typ === "background");

    res.json({ frames, backgrounds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Laden der Designs" });
  }
};


// Designauswahl speichern
export const setDesign = async (req, res) => {
  const userId = req.user.userId;
  const { type, designId } = req.body;
  
  if (!["frame", "background"].includes(type)) {
    return res.status(400).json({ error: "Ungültiger Design-Typ" });
  }

  const column = type === "frame" ? "frame_id" : "background_id";
  try {
    await pool.query(
      `UPDATE spieler SET ${column} = $1 WHERE user_id = $2`,
      [designId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Speichern" });
  }
};



// Erfolge


export const getAlleErfolge = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Alle Erfolge inkl. Bilder
    const erfolgeRes = await pool.query(`
      SELECT 
        e.id, e.bezeichnung, e.text, 
        e.belohnung1, d1.bild AS bild1,
        e.belohnung2, d2.bild AS bild2
      FROM erfolge e
      LEFT JOIN designs d1 ON d1.id = e.belohnung1
      LEFT JOIN designs d2 ON d2.id = e.belohnung2
      ORDER BY e.id ASC
    `);

    // Freigeschaltete Erfolge des Spielers
    const freigeschaltetRes = await pool.query(
      `SELECT erfolg_id, gesehen FROM erfolge_ref WHERE user_id = $1`,
      [userId]
    );

    res.json({
      erfolge: erfolgeRes.rows,
      freigeschaltet: freigeschaltetRes.rows
    });
  } catch (err) {
    console.error("Fehler beim Laden der Erfolge:", err);
    res.status(500).json({ error: "Fehler beim Laden der Erfolge" });
  }
};




export const markErfolgGesehen = async (req, res) => {
  const { erfolgId } = req.body;
  const userId = req.user.userId; 

  if (!erfolgId) {
    return res.status(400).json({ error: "Erfolg ID fehlt" });
  }

  try {
    await pool.query(
      `UPDATE erfolge_ref
       SET gesehen = 1 
       WHERE user_id = $1 AND erfolg_id = $2`,
      [userId, erfolgId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Markieren als gesehen:", err);
    res.status(500).json({ error: "Serverfehler beim Markieren" });
  }
};
