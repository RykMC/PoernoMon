import pool from '../db/db.js';

// Alle freigeschalteten Designs eines Users laden (Frames & Backgrounds getrennt)
export const getUserDesigns = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.typ, d.bild
       FROM designs_ref r
       JOIN designs d ON d.id = r.designid
       WHERE (r.userid = $1 OR r.userid = 0)`,
      [userId]
    );

    const rows = result.rows;

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

