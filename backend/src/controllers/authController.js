import pool from '../db/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Existiert bereits?
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0)
      return res.status(400).json({ error: 'E-Mail bereits vergeben' });

    // Passwort hashen
    const hashed = await bcrypt.hash(password, 10);

    // User einfügen
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, hashed]
    );
    const userId = userResult.rows[0].id;

    // Zufällige freie Kreatur auswählen (userid = 0)
    const creatureResult = await pool.query(
      'SELECT id, bild FROM kreaturen WHERE userid = 0 ORDER BY RANDOM() LIMIT 1'
    );

    if (creatureResult.rows.length === 0) {
      return res.status(500).json({ error: 'Keine freien Kreaturen verfügbar' });
    }

    const creatureId = creatureResult.rows[0].id;
    const creatureBild = creatureResult.rows[0].bild;

    // Kreatur dem neuen Spieler zuweisen
    await pool.query('UPDATE kreaturen SET userid = $1 WHERE id = $2', [userId, creatureId]);

    // Spieler mit Defaultwerten einfügen
    await pool.query(
      `INSERT INTO spieler (
        user_id, username, background_id, frame_id,
        skillpunkte, leben, coins, kampfstaub, max_leben, kreatur_bild
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [userId, "", 0, 0, 10, 30, 1000, 500, 30, creatureBild]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registrierung fehlgeschlagen' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'E-Mail nicht gefunden' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Falsches Passwort' });

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login fehlgeschlagen' });
  }
};


export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `
      SELECT 
        s.*, 
        df.bild AS frame_bild, 
        db.bild AS background_bild
      FROM spieler s
      LEFT JOIN designs df ON s.frame_id = df.id AND df.typ = 'frame'
      LEFT JOIN designs db ON s.background_id = db.id AND db.typ = 'background'
      WHERE s.user_id = $1;
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Spieler nicht gefunden' });
    }

    res.json({ spieler: result.rows[0] });
  } catch (err) {
    console.error('❌ /me Fehler:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Spielers' });
  }
};


export const setUsername = async (req, res) => {
  const { username } = req.body;
  const userId = req.user.userId;

  if (!username || username.length < 3) {
    return res.status(400).json({ error: "Name zu kurz" });
  }

  try {
    await pool.query(
      "UPDATE spieler SET username = $1 WHERE user_id = $2",
      [username, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Setzen des Namens:", err);
    res.status(500).json({ error: "Fehler beim Speichern" });
  }
};



export const getRandomPoernomon = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT username, kreatur_bild 
      FROM spieler 
      WHERE user_id != 0
      ORDER BY RANDOM()
      LIMIT 1
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Keine PoernoMons gefunden." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fehler beim Laden eines zufälligen PoernoMons:", err);
    res.status(500).json({ error: "Serverfehler beim Laden." });
  }
};



export const getRandomName = async (req, res) => {
  const userId = req.user.userId;
  try {
    // 1. Einen zufälligen Namen ziehen
    const result = await pool.query(
      "SELECT id, name FROM namen ORDER BY RANDOM() LIMIT 1"
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Keine Namen mehr verfügbar" });
    }

    const { id, name } = result.rows[0];

    // 2. Direkt aus der Tabelle löschen
    await pool.query("DELETE FROM namen WHERE id = $1", [id]);

    // 3. zum Bot machen
      await pool.query(
        "UPDATE spieler SET username = $1, bot = 1 WHERE user_id = $2",
        [name, userId]
      );
      
      res.json({ name });
  } catch (err) {
    console.error("Fehler beim Ziehen eines Namens:", err);
    res.status(500).json({ error: "Serverfehler beim Laden eines Namens" });
  }
};


export const getRandomBotEmail = async (req, res) => {
  try {
    const botRes = await pool.query(`
      SELECT u.email 
      FROM spieler s
      JOIN users u ON s.user_id = u.id
      WHERE s.bot = 1
      ORDER BY RANDOM()
      LIMIT 1
    `);

    if (botRes.rows.length === 0) {
      return res.status(404).json({ error: "Keine Bots gefunden" });
    }
    console.log("da:", botRes.rows[0]);
    res.json({ email: botRes.rows[0].email });
  } catch (err) {
    console.error("Fehler beim Laden eines Bot-Accounts:", err);
    res.status(500).json({ error: "Fehler beim Laden eines Bot-Accounts" });
  }
};




