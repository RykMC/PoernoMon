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
  k.id AS kampf_id,
  k.erstellt_am,
  k.spieler1_id,
  k.spieler2_id,
  k.gewinner_id,

  -- Dein Poernomon
  du.user_id AS mein_user_id,
  du.kreatur_bild AS mein_kreatur_bild,
  duf.bild AS mein_frame_bild,
  dub.bild AS mein_background_bild,

  -- Gegner
  gegner.user_id AS gegner_user_id,
  gegner.username AS gegner_username,
  gegner.kreatur_bild AS gegner_kreatur_bild,
  df.bild AS gegner_frame_bild,
  db.bild AS gegner_background_bild,

  -- Gesamtstatistik
  (SELECT COUNT(*) FROM kaempfe 
    WHERE (spieler1_id = $1 AND spieler2_id = gegner.user_id)
       OR (spieler2_id = $1 AND spieler1_id = gegner.user_id)
  ) AS gesamt_kaempfe,

  (SELECT COUNT(*) FROM kaempfe 
    WHERE spieler1_id = $1 AND spieler2_id = gegner.user_id
  ) AS ich_hab_ihn_angegriffen,

  (SELECT COUNT(*) FROM kaempfe 
    WHERE spieler2_id = $1 AND spieler1_id = gegner.user_id
  ) AS er_hat_mich_angegriffen,

  (SELECT COUNT(*) FROM kaempfe 
    WHERE ((spieler1_id = $1 AND spieler2_id = gegner.user_id)
        OR (spieler2_id = $1 AND spieler1_id = gegner.user_id))
      AND gewinner_id = $1
  ) AS gesamt_gewonnen

FROM kaempfe k
JOIN spieler du ON du.user_id = $1
JOIN designs duf ON duf.id = du.frame_id
JOIN designs dub ON dub.id = du.background_id

JOIN spieler gegner 
  ON (k.spieler1_id = $1 AND gegner.user_id = k.spieler2_id)
   OR (k.spieler2_id = $1 AND gegner.user_id = k.spieler1_id)
LEFT JOIN designs df ON df.id = gegner.frame_id
LEFT JOIN designs db ON db.id = gegner.background_id
WHERE k.spieler1_id = $1 OR k.spieler2_id = $1
ORDER BY k.erstellt_am DESC


    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Laden der Kampf-Statistik:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}

