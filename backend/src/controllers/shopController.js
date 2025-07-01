import pool from '../db/db.js';

export const getShopItems = async (req, res) => {
  const userId = req.user.userId;
console.log("Userid: ", userId);
  try {
    const shopRes = await pool.query(`
      SELECT 
        s.id AS shop_id,
        s.preis,
        s.datum,
        i.id AS item_id,
        i.bezeichnung,
        i.bild,
        i.bonus1was,
        i.bonus1wert,
        i.bonus2was,
        i.bonus2wert,
        i.bonus3was,
        i.bonus3wert,
        i.seltenheit,
        i.typ,
        u.username AS verkäufer
      FROM shop s
      JOIN items i ON s.item_id = i.id
      LEFT JOIN spieler u ON s.user_id = u.user_id
      WHERE s.user_id != $1
      ORDER BY s.datum DESC
    `, [userId]);

    res.json(shopRes.rows);
  } catch (err) {
    console.error("Fehler beim Laden des Shops:", err);
    res.status(500).json({ error: "Shop konnte nicht geladen werden" });
  }
};



export const buyShopItem = async (req, res) => {
  const shopId = req.params.id;
  const buyerId = req.user.userId;

  try {
    // Shopeintrag + Item + Verkäufer holen
    const shopRes = await pool.query(`
      SELECT s.*, i.userid AS seller_id, i.id AS item_id, i.im_shop, i.angelegt, i.typ, u.username AS seller_name
      FROM shop s
      JOIN items i ON s.item_id = i.id
      JOIN spieler u ON s.user_id = u.user_id
      WHERE s.id = $1
    `, [shopId]);

    if (shopRes.rowCount === 0) {
      return res.status(404).json({ error: "Shop-Eintrag nicht gefunden" });
    }

    const shopItem = shopRes.rows[0];

    if (shopItem.seller_id == buyerId) {
      return res.status(400).json({ error: "Kannst dein eigenes Item nicht kaufen" });
    }

    // Item dem Käufer übertragen
    await pool.query(`
      UPDATE items 
      SET userid = $1, im_shop = 0, angelegt = 0
      WHERE id = $2
    `, [buyerId, shopItem.item_id]);

    // Shop-Eintrag löschen
    await pool.query(`DELETE FROM shop WHERE id = $1`, [shopId]);

    // Nachricht an den Verkäufer
    await pool.query(`
      INSERT INTO nachrichten (von_id, an_id, betreff, text, datum, gelesen)
      VALUES ($1, $2, $3, $4, extract(epoch from now())::int, false)
    `, [
      buyerId, 
      shopItem.seller_id,
      "Dein Item wurde verkauft!",
      `Dein Item (${shopItem.typ}) wurde für ${shopItem.preis} Coins gekauft.`
    ]);

    // Coins-Transaktion (optional)
    await pool.query(`UPDATE spieler SET coins = coins - $1, items_gekauft = items_gekauft +1, coins_ausgegeben = coins_ausgegeben + $2 WHERE user_id = $3`, [shopItem.preis, shopItem.preis, buyerId]);
    await pool.query(`UPDATE spieler SET coins = coins + $1, items_verkauft = items_verkauft +1, gesamt_coins_verdient = gesamt_coins_verdient + $2 WHERE user_id = $3`, [shopItem.preis, shopItem.preis, shopItem.seller_id]);

    res.json({ success: true, message: "Item erfolgreich gekauft" });

  } catch (err) {
    console.error("Fehler beim Kaufen:", err);
    res.status(500).json({ error: "Konnte Item nicht kaufen" });
  }
};

