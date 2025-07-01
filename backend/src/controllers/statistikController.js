import pool from "../db/db.js";


export async function getSpielerStats(req, res) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT
        siege,
        niederlagen,
        siege_in_folge,
        niederlagen_in_folge,
        höchste_siege_in_folge,
        höchste_niederlagen_in_folge,
        gesamt_schaden_ausgeteilt,
        gesamt_schaden_erhalten,
        kritische_treffer,
        kritische_treffer_erhalten,
        ausgewichen,
        angriffe_verfehlt,
        items_gecraftet,
        items_gekauft,
        items_verkauft,
        gesamt_coins_verdient,
        coins_ausgegeben,
        gesamt_kampfstaub_verdient,
        kampfstaub_ausgegeben,
        höchster_schaden_mit_einem_schlag,
        höchste_xp_in_einem_kampf,
        höchster_gewinn_in_coins,
        höchste_kampfstaub_in_einem_kampf,
        geblockter_schaden,
        kaempfe_insgesamt,
        level,
        xp

      FROM spieler
      WHERE user_id = $1
    `, [userId]);

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
      "kaempfe_insgesamt"
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
        ORDER BY s.${metric} DESC
        LIMIT 50
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Laden des Rankings:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}