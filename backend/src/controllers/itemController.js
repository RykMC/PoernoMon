import pool from "../db/db.js";
import { checkErfolgeNachCraft } from "../utils/erfolge.js";
import { validateEquip, validateSell } from "../models/index.js";

export async function getItems(req, res) {
  try {
    const userId = req.user.userId;
    const result = await pool.query(`
      SELECT * FROM items WHERE userid = $1 ORDER BY datum DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fehler beim Laden der Items:", err);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}



export async function equipItem(req, res) {
  const data = validateEquip(req, res);
      if (!data) return;
      const { slot, itemId } = data;
      const userId = req.user.userId;
  try {
      
    // === 1. alten Wert wieder abziehen (falls da was angelegt ist)
    const oldItemRes = await pool.query(
      `SELECT * FROM items WHERE userid = $1 AND typ = $2 AND angelegt = 1`,
      [userId, slot]
    );

    if (oldItemRes.rows.length > 0) {
      const oldItem = oldItemRes.rows[0];

      // Baue dynamisches UPDATE
      let setParts = [];
      let values = [];
      let i = 1;

      for (let x = 1; x <= 3; x++) {
        const was = oldItem[`bonus${x}was`];
        const wert = oldItem[`bonus${x}wert`];
        if (was && wert !== null) {
          setParts.push(`${was} = ${was} - $${i}`);
          values.push(wert);
          i++;
        }
      }
      if (setParts.length > 0) {
        values.push(userId);
        await pool.query(
          `UPDATE spieler SET ${setParts.join(", ")} WHERE user_id = $${i}`,
          values
        );
      }
    }

    // === 2. alle aus slot auf nicht angelegt
    await pool.query(
      `UPDATE items SET angelegt = 0 WHERE userid = $1 AND typ = $2`,
      [userId, slot]
    );
    

    if (!itemId) {
       return res.json({ success: true, message: `'${slot}' wurde abgelegt.` });
    }

    // === 3. neues Item
    const itemRes = await pool.query(
      `SELECT * FROM items WHERE id = $1 AND userid = $2`,
      [itemId, userId]
    );
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: "Item nicht gefunden oder gehört dir nicht" });
    }
    const newItem = itemRes.rows[0];

    // === 4. anlegen
    await pool.query(
      `UPDATE items SET angelegt = 1 WHERE id = $1 AND userid = $2`,
      [itemId, userId]
    );

    // === 5. Boni aufaddieren
    let setPartsAdd = [];
    let valuesAdd = [];
    let j = 1;

    for (let x = 1; x <= 3; x++) {
      const was = newItem[`bonus${x}was`];
      const wert = newItem[`bonus${x}wert`];
      if (was && wert !== null) {
        setPartsAdd.push(`${was} = ${was} + $${j}`);
        valuesAdd.push(wert);
        j++;
      }
    }

    if (setPartsAdd.length > 0) {
      valuesAdd.push(userId);
      await pool.query(
        `UPDATE spieler SET ${setPartsAdd.join(", ")} WHERE user_id = $${j}`,
        valuesAdd
      );
    }

    return res.json({ success: true, message: `Du hast ${newItem.bezeichnung} angelegt.` });

    } catch (err) {
      console.error("Fehler beim Ausrüsten:", err);
      return res.status(500).json({ error: "Serverfehler" });
    }
}

const genitiveMap = {
  angriff: "des Angriffs",
  krit_chance: "der Chance",
  krit_schaden: "des Schadens",
  doppelschlag: "des Doppelschlags",
  verteidigen: "der Verteidigung",
  ausweichen: "des Ausweichens",
  max_leben: "des Lebens",
  leben_pro_treffer: "der Heilung",
  gluck: "des Glücks",
  mehr_xp: "der Erfahrung",
  mehr_coins: "des Reichtums",
  mehr_kampfstaub: "des Staubs"
};


export async function craftItem(req, res) {
  try {
    const userId = req.user.userId;

    // Hole Spieler für Level + Kampfstaub
    const spielerRes = await pool.query(
      "SELECT level, kampfstaub FROM spieler WHERE user_id = $1",
      [userId]
    );
    const spieler = spielerRes.rows[0];
    if (!spieler) return res.status(404).json({ error: "Spieler nicht gefunden" });

    if (spieler.kampfstaub < 500) {
      return res.status(400).json({ error: "Nicht genug Kampfstaub" });
    }

    // 500 Kampfstaub abziehen
    await pool.query(
      "UPDATE spieler SET kampfstaub = kampfstaub - 500, items_gecraftet = items_gecraftet +1, kampfstaub_ausgegeben = kampfstaub_ausgegeben + 500 WHERE user_id = $1",
      [userId]
    );

    // === Boni ohne doppelte Typen ===
    const typen = ["waffe", "kopfschutz", "brustschutz", "beinschutz"];
    const eigenschaften = Object.keys(genitiveMap);
    const itemTyp = typen[Math.floor(Math.random() * typen.length)];

    const boniMap = {}; // { angriff: 4, krit: 2 }

    function addBonus() {
      const typ = eigenschaften[Math.floor(Math.random() * eigenschaften.length)];
      const wert = Math.max(1, Math.floor(Math.random() * spieler.level) + 1);

      if (boniMap[typ]) {
        boniMap[typ] += wert; // addiere wenn schon vorhanden
      } else {
        boniMap[typ] = wert;
      }
    }

    // Garantiert 1 Bonus
    addBonus();

    // Mit 10% Chance Bonus 2
    if (Math.random() < 0.1) addBonus();

    // Mit weiteren 10% Chance Bonus 3
    if (Math.random() < 0.1) addBonus();

    // Map in Array konvertieren
    const boni = Object.entries(boniMap).map(([was, wert]) => ({ was, wert }));

    // Bezeichnung
    const bezeichnung = `${itemTyp.charAt(0).toUpperCase() + itemTyp.slice(1)} ${genitiveMap[boni[0].was]}`;

    // Bild anhand Typ
    const bild = `images/items/${itemTyp}${Math.floor(Math.random() * 16) + 1}.png`;

    // Seltenheit anhand eindeutiger Boni
    let seltenheit = "normal";
    if (boni.length === 2) seltenheit = "selten";
    if (boni.length >= 3) seltenheit = "legendär";

    // Datum
    const datum = Math.floor(Date.now() / 1000) + 86400;

    // DB Insert
    const newItemRes = await pool.query(`
      INSERT INTO items 
      (userid, typ, bonus1was, bonus1wert, bonus2was, bonus2wert, bonus3was, bonus3wert, bezeichnung, bild, datum, im_shop, angelegt, level, seltenheit)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 0, $12, $13)
      RETURNING *
    `, [
      userId,
      itemTyp,
      boni[0]?.was || null,
      boni[0]?.wert || null,
      boni[1]?.was || null,
      boni[1]?.wert || null,
      boni[2]?.was || null,
      boni[2]?.wert || null,
      bezeichnung,
      bild,
      datum,
      spieler.level, 
      seltenheit
    ]);

    const newItem = newItemRes.rows[0];

    await checkErfolgeNachCraft(userId);
    return res.json({ 
      success: true,
      message: `Du hast ein ${seltenheit}es Item gecraftet!`,
      item: newItem
    });

  } catch (err) {
    console.error("Fehler beim Craften:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
}


export const destroyItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.userId;

  try {
    // Prüfen, ob das Item dem Spieler gehört
    const itemRes = await pool.query(
      "SELECT id FROM items WHERE id = $1 AND userid = $2",
      [itemId, userId]
    );

    if (itemRes.rowCount === 0) {
      return res.status(404).json({ error: "Item nicht gefunden oder gehört dir nicht" });
    }

    // Kampfstaub zwischen 3 und 15 generieren
    const kampfstaub = Math.floor(Math.random() * 13) + 3; // 3 bis 15

    // Kampfstaub gutschreiben
    await pool.query(
      "UPDATE spieler SET kampfstaub = kampfstaub + $1, kampfstaub_durch_entcraften = kampfstaub_durch_entcraften + $1, items_entcraftet = items_entcraftet +1 WHERE user_id = $2",
      [kampfstaub, userId]
    );

    // Item löschen
    await pool.query(
      "DELETE FROM items WHERE id = $1 AND userid = $2",
      [itemId, userId]
    );

    res.json({ 
      success: true, 
      message: `Item vernichtet. Du hast ${kampfstaub} Kampfstaub zurückbekommen.` 
    });
  } catch (err) {
    console.error("Fehler beim Vernichten:", err);
    res.status(500).json({ error: "Item konnte nicht vernichtet werden" });
  }
};



export const sellItem = async (req, res) => {
  const data = validateSell(req, res);

  if (!data) return;
  
  const { preis } = data;
  const itemId = Number(req.params.id);
  const userId = req.user.userId;
  
  try {
    // Prüfen, ob Item existiert und dem User gehört
    const itemRes = await pool.query(
      "SELECT id FROM items WHERE id = $1 AND userid = $2 AND im_shop = 0",
      [itemId, userId]
    );

    if (itemRes.rowCount === 0) {
      return res.status(404).json({ error: "Item nicht gefunden oder bereits im Shop" });
    }

    const datum = Math.floor(Date.now() / 1000);
    // In Shop-Tabelle eintragen
    await pool.query(
      "INSERT INTO shop (item_id, user_id, preis, datum) VALUES ($1, $2, $3, $4)",
      [itemId, userId, preis, datum]
    );

    // Item markieren
    await pool.query(
      "UPDATE items SET im_shop = 1 WHERE id = $1 AND userid = $2",
      [itemId, userId]
    );

    res.json({ success: true, message: "Item wurde im Shop eingestellt" });
  } catch (err) {
    console.error("Fehler beim Verkaufen:", err);
    res.status(500).json({ error: "Item konnte nicht verkauft werden" });
  }
};


export const unsellItem = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.userId;
  try {
    // Check ob im Shop & dir gehörend
    const check = await pool.query(
      "SELECT * FROM shop WHERE item_id = $1 AND user_id = $2",
      [itemId, userId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Item nicht im Shop oder gehört dir nicht" });
    }

    // Aus shop Tabelle entfernen
    await pool.query(
      "DELETE FROM shop WHERE item_id = $1 AND user_id = $2",
      [itemId, userId]
    );

    // Items-Tabelle zurücksetzen
    await pool.query(
      "UPDATE items SET im_shop = 0 WHERE id = $1 AND userid = $2",
      [itemId, userId]
    );

    res.json({ success: true, message: "Item aus dem Shop genommen" });
  } catch (err) {
    console.error("Fehler beim Unsell:", err);
    res.status(500).json({ error: "Konnte Item nicht aus dem Shop nehmen" });
  }
};



export const usePotion = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.user.userId;

  try {
    // Trank holen und prüfen, ob er dem Spieler gehört
    const itemRes = await pool.query(
      `SELECT * FROM items WHERE id = $1 AND userid = $2 AND typ = 'trank'`,
      [itemId, userId]
    );

    if (itemRes.rowCount === 0) {
      return res.status(404).json({ error: "Trank nicht gefunden oder gehört dir nicht." });
    }

    // Spieler + Leben holen
    const spielerRes = await pool.query(
      `SELECT leben, max_leben 
       FROM spieler 
       WHERE user_id = $1`,
      [userId]
    );

    if (spielerRes.rowCount === 0) {
      return res.status(404).json({ error: "Spieler oder PoernoMon nicht gefunden." });
    }

    let { leben, max_leben } = spielerRes.rows[0];
    let neuesLeben = Math.min(leben + 30, max_leben);

    // Leben updaten
    await pool.query(
      `UPDATE spieler 
       SET leben = $1 
       WHERE user_id = $2`,
      [neuesLeben, userId]
    );

    // Trank aus Inventar löschen
    await pool.query(`DELETE FROM items WHERE id = $1`, [itemId]);

    res.json({ success: true, message: `Trank benutzt. Leben: ${neuesLeben}/${max_leben}` });

  } catch (err) {
    console.error("Fehler beim Benutzen des Tranks:", err);
    res.status(500).json({ error: "Trank konnte nicht benutzt werden" });
  }
};





