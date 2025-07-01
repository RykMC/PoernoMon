import pool from '../db/db.js';

export const getPoernomon = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Spieler + Kreaturbild
    const spielerRes = await pool.query(
      `SELECT 
        s.*, 
        df.bild AS frame_bild, 
        db.bild AS background_bild
      FROM spieler s
      LEFT JOIN designs df ON s.frame_id = df.id AND df.typ = 'frame'
      LEFT JOIN designs db ON s.background_id = db.id AND db.typ = 'background'
      WHERE s.user_id = $1;`,
      [userId]
    );
    const spieler = spielerRes.rows[0];
    if (!spieler) return res.status(404).json({ error: "Nicht gefunden" });

    // Items für Auswahl
    const itemsRes = await pool.query(
      "SELECT * FROM items WHERE userid = $1 ORDER BY datum DESC",
      [userId]
    );

    // Bonus-Felder als Array zusammenbauen
    const items = itemsRes.rows.map(item => ({
      id: item.id,
      typ: item.typ,
      bezeichnung: item.bezeichnung,
      bild: item.bild,
      angelegt: item.angelegt,
      shop: item.im_shop,
      seltenheit: item.seltenheit,
      boni: [
        { was: item.bonus1was, wert: item.bonus1wert },
        { was: item.bonus2was, wert: item.bonus2wert },
        { was: item.bonus3was, wert: item.bonus3wert }
      ].filter(b => b.was)
    }));

    // XP für aktuelle und nächste Stufe laden
    const currentLevelRes = await pool.query(
      "SELECT xp_benoetigt FROM levelstufen WHERE level = $1",
      [spieler.level]
    );
    const nextLevelRes = await pool.query(
      "SELECT xp_benoetigt FROM levelstufen WHERE level = $1",
      [spieler.level + 1]
    );

    const xpAktuellesLevel = currentLevelRes.rows[0]?.xp_benoetigt || 0;
    const xpNaechstesLevel = nextLevelRes.rows[0]?.xp_benoetigt || null;

    res.json({
      name: spieler.username,
      level: spieler.level,
      xp: spieler.xp,
      xpAktuellesLevel,
      xpNaechstesLevel,
      kreatur_bild: spieler.kreatur_bild,
      skillpunkte: spieler.skillpunkte,
      leben: spieler.leben,
      background_id: spieler.background_id,
      frame_id: spieler.frame_id,
      frame_bild: spieler.frame_bild,
      background_bild: spieler.background_bild,
      eigenschaften: {
        angriff: spieler.angriff,
        krit_chance: spieler.krit_chance,
        krit_schaden: spieler.krit_schaden,
        doppelschlag: spieler.doppelschlag,
        ausweichen: spieler.ausweichen,
        verteidigen: spieler.verteidigen,
        leben_pro_treffer: spieler.leben_pro_treffer,
        max_leben: spieler.max_leben,
        gluck: spieler.gluck,
        mehr_xp: spieler.mehr_xp,
        mehr_kampfstaub: spieler.mehr_kampfstaub,
        mehr_coins: spieler.mehr_coins
      },
      items: items
    });
  } catch (err) {
    console.error("Fehler:", err);
    res.status(500).json({ error: "Fehler beim Laden" });
  }
};



export const skillEigenschaft = async (req, res) => {
 const userId = req.user.userId;
  const { eigenschaft } = req.body;

  const erlaubteFelder = [
    "angriff", "krit_chance", "krit_schaden", "doppelschlag", "verteidigen", "ausweichen",
    "leben_pro_treffer", "max_leben", "gluck", "mehr_kampfstaub", "mehr_xp", "mehr_coins"
  ];

  if (!erlaubteFelder.includes(eigenschaft)) {
    return res.status(400).json({ error: "Ungültige Eigenschaft" });
  }

  try {
    const { rows } = await pool.query("SELECT * FROM spieler WHERE user_id = $1", [userId]);
    const p = rows[0];
    if (!p) return res.status(404).json({ error: "Poernomon nicht gefunden" });
    if (p.skillpunkte <= 0) return res.status(400).json({ error: "Keine Skillpunkte übrig" });

    // Eigenschaft +1, Skillpunkt -1
    await pool.query(`
      UPDATE spieler 
      SET ${eigenschaft} = ${eigenschaft} + 1,
          skillpunkte = skillpunkte - 1
      WHERE user_id = $1
    `, [userId]);

    // Spieler + Kreaturbild
    const spielerRes = await pool.query(
      `SELECT 
        s.*, 
        df.bild AS frame_bild, 
        db.bild AS background_bild
      FROM spieler s
      LEFT JOIN designs df ON s.frame_id = df.id AND df.typ = 'frame'
      LEFT JOIN designs db ON s.background_id = db.id AND db.typ = 'background'
      WHERE s.user_id = $1;`,
      [userId]
    );
    const spieler = spielerRes.rows[0];

    if (!spieler) return res.status(404).json({ error: "Nicht gefunden" });

 // Items für Auswahl
    const itemsRes = await pool.query(
      "SELECT * FROM items WHERE userid = $1 ORDER BY datum DESC",
      [userId]
    );

      // XP für aktuelle und nächste Stufe laden
  const currentLevelRes = await pool.query(
    "SELECT xp_benoetigt FROM levelstufen WHERE level = $1",
    [spieler.level]
  );
  const nextLevelRes = await pool.query(
    "SELECT xp_benoetigt FROM levelstufen WHERE level = $1",
    [spieler.level + 1]
  );

    const xpAktuellesLevel = currentLevelRes.rows[0]?.xp_benoetigt || 0;
    const xpNaechstesLevel = nextLevelRes.rows[0]?.xp_benoetigt || null;

      // Bonus-Felder als Array zusammenbauen
      const items = itemsRes.rows.map(item => ({
        id: item.id,
        typ: item.typ,
        bezeichnung: item.bezeichnung,
        bild: item.bild,
        angelegt: item.angelegt,
        shop: item.im_shop,
        boni: [
          { was: item.bonus1was, wert: item.bonus1wert },
          { was: item.bonus2was, wert: item.bonus2wert },
          { was: item.bonus3was, wert: item.bonus3wert }
        ].filter(b => b.was)
      }));

    res.json({
      name: spieler.username,
      level: spieler.level,
      xp: spieler.xp,
      xpAktuellesLevel,
      xpNaechstesLevel,
      kreatur_bild: spieler.kreatur_bild,
      skillpunkte: spieler.skillpunkte,
      leben: spieler.leben,
      background_id: spieler.background_id,
      frame_id: spieler.frame_id,
      frame_bild: spieler.frame_bild,
      background_bild: spieler.background_bild,
      eigenschaften: {
        angriff: spieler.angriff,
        krit_chance: spieler.krit_chance,
        krit_schaden: spieler.krit_schaden,
        doppelschlag: spieler.doppelschlag,
        ausweichen: spieler.ausweichen,
        verteidigen: spieler.verteidigen,
        leben_pro_treffer: spieler.leben_pro_treffer,
        max_leben: spieler.max_leben,
        gluck: spieler.gluck,
        mehr_xp: spieler.mehr_xp,
        mehr_kampfstaub: spieler.mehr_kampfstaub,
        mehr_coins: spieler.mehr_coins
      },
      items: items,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Skillpunkt konnte nicht vergeben werden" });
  }
};
