import pool from "../db/db.js";
import { simulateFight  } from "../utils/kampfEngine.js";

export const matchmaking = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. Eigenen Spieler laden
    const { rows } = await pool.query("SELECT * FROM spieler WHERE user_id = $1", [userId]);
    const player = rows[0];
    if (!player) return res.status(404).json({ error: "Spieler nicht gefunden" });
    if (player.leben < 30) return res.status(400).json({ error: "Nicht genug Leben" });

    // 2. Gegner suchen mit Level +-1 und mind. 30 Leben
    const { rows: gegnerRows } = await pool.query(
      `SELECT * FROM spieler 
       WHERE leben >= 30 AND user_id != $1 AND level BETWEEN $2 AND $3
       ORDER BY RANDOM()
       LIMIT 1`,
      [userId, player.level - 1, player.level + 1]
    );

    const gegner = gegnerRows[0];
    if (!gegner) return res.status(404).json({ error: "Kein passender Gegner gefunden" });

    // 3. Kampf starten + speichern
    const result  = await simulateFight (player, gegner);
    res.json(result);
  } catch (err) {
    console.error("Fehler beim Matchmaking:", err);
    res.status(500).json({ error: "Interner Fehler beim Matchmaking" });
  }
};



export const getKampfverlauf = async (req, res) => {
  const kampfId = req.params.kampfId;
  try {
    const verlauf = await pool.query(`
      SELECT 
        kv.*,
        a.username AS angreifer_name,
        a.kreatur_bild AS angreifer_bild,
        v.username AS verteidiger_name,
        v.kreatur_bild AS verteidiger_bild
      FROM kampfverlauf kv
      LEFT JOIN spieler a ON kv.angreifer_id = a.user_id
      LEFT JOIN spieler v ON kv.verteidiger_id = v.user_id
      WHERE kv.kampf_id = $1
      ORDER BY kv.runde ASC
    `, [kampfId]);

    const kampfMeta = await pool.query(`
      SELECT 
        k.*, 
        s1.username AS spieler1_name,
        s1.kreatur_bild AS spieler1_bild,
        s1.leben AS spieler1_leben,
        s1.max_leben AS spieler1_max,
        s1.frame_id AS spieler1_frame_id,
        s1.background_id AS spieler1_background_id,
        s1.user_id AS spieler1_user_id,
        df1.bild AS spieler1_frame_bild,
        db1.bild AS spieler1_background_bild,

        s2.username AS spieler2_name,
        s2.kreatur_bild AS spieler2_bild,
        s2.leben AS spieler2_leben,
        s2.max_leben AS spieler2_max,
        s2.frame_id AS spieler2_frame_id,
        s2.background_id AS spieler2_background_id,
        s2.user_id AS spieler2_user_id,
        df2.bild AS spieler2_frame_bild,
        db2.bild AS spieler2_background_bild,

        w1.bild AS spieler1_waffe_bild, w1.seltenheit AS spieler1_waffe_seltenheit,
        k1.bild AS spieler1_kopfschutz_bild, k1.seltenheit AS spieler1_kopfschutz_seltenheit,
        b1.bild AS spieler1_brustschutz_bild, b1.seltenheit AS spieler1_brustschutz_seltenheit,
        h1.bild AS spieler1_beinschutz_bild, h1.seltenheit AS spieler1_beinschutz_seltenheit,

        w2.bild AS spieler2_waffe_bild, w2.seltenheit AS spieler2_waffe_seltenheit,
        k2.bild AS spieler2_kopfschutz_bild, k2.seltenheit AS spieler2_kopfschutz_seltenheit,
        b2.bild AS spieler2_brustschutz_bild, b2.seltenheit AS spieler2_brustschutz_seltenheit,
        h2.bild AS spieler2_beinschutz_bild, h2.seltenheit AS spieler2_beinschutz_seltenheit

      FROM kaempfe k
      JOIN spieler s1 ON k.spieler1_id = s1.user_id
      JOIN spieler s2 ON k.spieler2_id = s2.user_id
      LEFT JOIN designs df1 ON s1.frame_id = df1.id AND df1.typ = 'frame'
      LEFT JOIN designs db1 ON s1.background_id = db1.id AND db1.typ = 'background'
      LEFT JOIN designs df2 ON s2.frame_id = df2.id AND df2.typ = 'frame'
      LEFT JOIN designs db2 ON s2.background_id = db2.id AND db2.typ = 'background'

      LEFT JOIN items w1 ON w1.userid = s1.user_id AND w1.typ = 'waffe' AND w1.angelegt = 1
      LEFT JOIN items k1 ON k1.userid = s1.user_id AND k1.typ = 'kopfschutz' AND k1.angelegt = 1
      LEFT JOIN items b1 ON b1.userid = s1.user_id AND b1.typ = 'brustschutz' AND b1.angelegt = 1
      LEFT JOIN items h1 ON h1.userid = s1.user_id AND h1.typ = 'beinschutz' AND h1.angelegt = 1

      LEFT JOIN items w2 ON w2.userid = s2.user_id AND w2.typ = 'waffe' AND w2.angelegt = 1
      LEFT JOIN items k2 ON k2.userid = s2.user_id AND k2.typ = 'kopfschutz' AND k2.angelegt = 1
      LEFT JOIN items b2 ON b2.userid = s2.user_id AND b2.typ = 'brustschutz' AND b2.angelegt = 1
      LEFT JOIN items h2 ON h2.userid = s2.user_id AND h2.typ = 'beinschutz' AND h2.angelegt = 1

      WHERE k.id = $1
    `, [kampfId]);

    res.json({
      spieler1: {
        name: kampfMeta.rows[0].spieler1_name,
        bild: kampfMeta.rows[0].spieler1_bild,
        leben: kampfMeta.rows[0].spieler1_leben,
        max_leben: kampfMeta.rows[0].spieler1_max,
        frame: kampfMeta.rows[0].spieler1_frame_bild,
        background: kampfMeta.rows[0].spieler1_background_bild,
        user_id: kampfMeta.rows[0].spieler1_user_id,
        items: [
          { typ: "waffe", bild: kampfMeta.rows[0].spieler1_waffe_bild, seltenheit: kampfMeta.rows[0].spieler1_waffe_seltenheit },
          { typ: "kopfschutz", bild: kampfMeta.rows[0].spieler1_kopfschutz_bild, seltenheit: kampfMeta.rows[0].spieler1_kopfschutz_seltenheit },
          { typ: "brustschutz", bild: kampfMeta.rows[0].spieler1_brustschutz_bild, seltenheit: kampfMeta.rows[0].spieler1_brustschutz_seltenheit },
          { typ: "beinschutz", bild: kampfMeta.rows[0].spieler1_beinschutz_bild, seltenheit: kampfMeta.rows[0].spieler1_beinschutz_seltenheit }
        ]
      },
      spieler2: {
        name: kampfMeta.rows[0].spieler2_name,
        bild: kampfMeta.rows[0].spieler2_bild,
        leben: kampfMeta.rows[0].spieler2_leben,
        max_leben: kampfMeta.rows[0].spieler2_max,
        frame: kampfMeta.rows[0].spieler2_frame_bild,
        background: kampfMeta.rows[0].spieler2_background_bild,
        user_id: kampfMeta.rows[0].spieler2_user_id,
        items: [
          { typ: "waffe", bild: kampfMeta.rows[0].spieler2_waffe_bild, seltenheit: kampfMeta.rows[0].spieler2_waffe_seltenheit },
          { typ: "kopfschutz", bild: kampfMeta.rows[0].spieler2_kopfschutz_bild, seltenheit: kampfMeta.rows[0].spieler2_kopfschutz_seltenheit },
          { typ: "brustschutz", bild: kampfMeta.rows[0].spieler2_brustschutz_bild, seltenheit: kampfMeta.rows[0].spieler2_brustschutz_seltenheit },
          { typ: "beinschutz", bild: kampfMeta.rows[0].spieler2_beinschutz_bild, seltenheit: kampfMeta.rows[0].spieler2_beinschutz_seltenheit }
        ]       
      },
      verlauf: verlauf.rows
    });

  } catch (err) {
    console.error("Fehler beim Laden des Kampfs:", err);
    res.status(500).json({ error: "Kampfverlauf konnte nicht geladen werden" });
  }
};


