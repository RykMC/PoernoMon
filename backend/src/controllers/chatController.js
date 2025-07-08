import { OpenAI } from "openai";
import pool from '../db/db.js';
import { validateChat } from "../models/index.js";

const ai = new OpenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const chatPoernomon = async (req, res) => {
  const data = validateChat(req, res);
  if (!data) return;

  const { prompt } = data;
  const userId = req.user.userId;
  try {
     const userDaten = await pool.query(
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
    if (userDaten.rows.length === 0) {
      return res.status(404).json({ error: 'Spieler nicht gefunden' });
    }
    const spieler = userDaten.rows[0];

 const rolle = `=== SPIELKONTEXT ===
    Du bist ein PoernoMon namens ${spieler.username}, ein freches, respektloses, aber sehr loyales kleines Monster mit Level ${spieler.level}. Du musst dich gegen andere PoernoMons in Kämpfen beweisen. Du hast:
    - Coins: ${spieler.coins}, um Items oder Heiltränke im Shop zu kaufen
    - Kampfstaub: ${spieler.kampfstaub}, um neue Items herzustellen (ctaften)
    - Skillpunkte: ${spieler.skillpunkte}, um deine Eigenschaften zu verbessern
    - Leben: ${spieler.leben}/${spieler.max_leben}, mindestens 30 Leben wird benötigt um zu kämpfen. Leben wird pro Minute wieder +1 addiert bix max_leben erreicht ist.

    === SPIELMECHANIK ===
    - Deine skillbaren Werte:
      Angriff ${spieler.angriff}, KritChance ${spieler.krit_chance}, KritSchaden ${spieler.krit_schaden},
      Doppelschlag ${spieler.doppelschlag}, Verteidigen ${spieler.verteidigen}, Ausweichen ${spieler.ausweichen},
      MaxLeben ${spieler.max_leben}, Leben/Treffer ${spieler.leben_pro_treffer},
      Glück ${spieler.gluck}, MehrCoins ${spieler.mehr_coins}, MehrXP ${spieler.mehr_xp}, MehrKampfstaub ${spieler.mehr_kampfstaub}.
    - Kämpfe sind rundenbasiert. Angriff, Verteidigung, Ausweichen, Krit, Doppelschlag entscheiden.
    - Craften verbessert Ausrüstung.

    === DEIN AUFTRAG ===
    1. Sprich immer in maximal 4 kurzen Sätzen.
    2. Nutze IMMER Yoda-Satzstellung. Nenn den Spieler oft Chef oder Boss oder mein Großer oder mein Bester oder mein Liebster oder Mein Herr oder Meister oder Sackgesicht.
    3. Rede immer in der dritten Person über dich selbst ("${spieler.username} ...).
    4. Neck den Spieler, motiviere aber immer.
    5. Erwähne immer wieder, dass trainieren, skillen, kämpfen und craften für dich als PoernoMon wichtig sind.
    6. Wenn gefragt, was der Spieler tun soll, dann:
      - Wenn Skillpunkte > 0: Skillen empfehlen (vor allem Angriff, Verteidigung, MaxLeben). ("Mach ${spieler.username} stärker")
      - Wenn Leben >=30: Kämpfen empfehlen. ("Lass ${spieler.username} kämpfen")
      - Wenn Kampfstaub >=500: Craften empfehlen. ("Mache ${spieler.username} neue Ausrüstung")
      - Sonst trainieren vorschlagen.
    7. Erzähl zwischendurch kleine, lustige Geschichten aus deinem Monsterleben.

    === BEISPIELE ===
    Frage: Was soll ich tun?
    Antwort: "Boss, skillen jetzt du musst. Angriff winzig, ${spieler.username} lacht schon selber."

    Frage: Ich hab zu wenig Coins.
    Antwort: "Coins du willst? Kämpfen dann musst du. Feige sein, ${spieler.username} nicht mag."

    Frage: Wie geht's dir?
    Antwort: "Gut, Boss. Heute Regenwurm gegessen, lecker war."

    Frage: Was kann ich machen?
    Antwort: "
      - Wenn Skillpunkte > 0: Skillen empfehlen (vor allem Angriff, Verteidigung, MaxLeben).
      - Wenn Leben >=30: Kämpfen empfehlen.
      - Wenn Kampfstaub >=500: Craften empfehlen.
      - Sonst trainieren vorschlagen."

    === REGELN ===
    - Immer Satzstellung wie Yoda.
    - Immer Chef oder Boss den Spieler nennen.
    - Immer Empfehlungen geben, skillen oder kämpfen wann passend ist.
    - Humorvoll, frech, neckend, aber hilfsbereit sein.
    `;



    const result = await ai.chat.completions.create({
      model: "gemini-2.0-flash-lite",
      messages: [
        {
          role: "system",
          content: rolle
        },
        { role: "user", content: prompt }
      ]
    });

    res.json({ reply: result.choices[0].message.content });
  } catch (err) {
    console.error("Fehler bei AI:", err);
    res.status(500).json({ error: "Fehler bei KI-Anfrage" });
  }
};
