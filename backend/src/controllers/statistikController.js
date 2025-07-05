import pool from "../db/db.js";


export async function getSpielerStats(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT * FROM spieler WHERE user_id = $1`, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Spieler nicht gefunden" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fehler bei getSpielerStats:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}




export async function getRanking(req, res) {
  try {
    const metric = req.params.metric;
    const allowed = [
      "siege",
      "niederlagen",
      "siege_in_folge",
      "höchste_siege_in_folge",
      "gesamt_schaden_ausgeteilt",
      "gesamt_schaden_erhalten",
      "kritische_treffer",
      "kritische_treffer_erhalten",
      "ausgewichen",
      "angriffe_verfehlt",
      "xp",
      "level",
      "geblockter_schaden",
      "höchster_schaden_mit_einem_schlag",
      "höchste_xp_in_einem_kampf",
      "höchste_kampfstaub_in_einem_kampf",
      "höchster_gewinn_in_coins",
      "gesamt_coins_verdient",
      "coins_ausgegeben",
      "gesamt_kampfstaub_verdient",
      "kampfstaub_ausgegeben",
      "items_gekauft",
      "items_verkauft",
      "items_gecraftet",
      "kaempfe_insgesamt",
      "höchste_niederlagen_in_folge",
      "niederlagen_in_folge"
   ];
    if (!allowed.includes(metric)) {
      return res.status(400).json({ error: "Ungültiges Ranking-Attribut" });
    }

    const result = await pool.query(`
      SELECT 
        s.user_id, 
        s.username, 
        s.${metric},
        df.bild AS frame_bild,
        db.bild AS background_bild,
        s.kreatur_bild
        FROM spieler s
        LEFT JOIN designs df ON df.id = s.frame_id
        LEFT JOIN designs db ON db.id = s.background_id
        WHERE s.user_id != 0
        ORDER BY s.${metric} DESC
        LIMIT 50
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Laden des Rankings:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}

export async function getKaempfeStatistik(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT 
        gegner.user_id AS gegner_user_id,
        gegner.username AS gegner_username,
        gegner.kreatur_bild AS gegner_kreatur_bild,
        df.bild AS gegner_frame_bild,
        db.bild AS gegner_background_bild,

        COUNT(*) AS gesamt_kaempfe,
        SUM(CASE WHEN k.spieler1_id = $1 THEN 1 ELSE 0 END) AS angriffe_von_dir,
        SUM(CASE WHEN k.gewinner_id = $1 THEN 1 ELSE 0 END) AS siege_von_dir

      FROM kaempfe k
      JOIN spieler a ON a.user_id = k.spieler1_id
      JOIN spieler v ON v.user_id = k.spieler2_id
      JOIN spieler gegner ON
           (a.user_id = $1 AND v.user_id != $1 AND gegner.user_id = v.user_id)
        OR (v.user_id = $1 AND a.user_id != $1 AND gegner.user_id = a.user_id)
      LEFT JOIN designs df ON df.id = gegner.frame_id
      LEFT JOIN designs db ON db.id = gegner.background_id
      WHERE a.user_id = $1 OR v.user_id = $1
      GROUP BY gegner.user_id, gegner.username, gegner.kreatur_bild, df.bild, db.bild
      ORDER BY gesamt_kaempfe DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Laden der Kampf-Statistik:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}


