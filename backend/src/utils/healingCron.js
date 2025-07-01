import pool from "../db/db.js";

export async function healPoernos() {
  try {
    const res = await pool.query(`
      UPDATE spieler
      SET leben = leben + 1
      WHERE leben < max_leben
    `);
    console.log(`💚 Geheilt: ${res.rowCount} Poernomons`);
  } catch (err) {
    console.error("❌ Fehler beim Heilen:", err);
  }
}
