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


export async function checkTrainings() {
  try {
    const now = Math.floor(Date.now() / 1000);

    // Alle Trainings finden, die fertig sind
    const trainings = await pool.query(
      `SELECT * FROM training WHERE aktiv = 1 AND endzeit <= $1`,
      [now]
    );

    for (let train of trainings.rows) {
      let column;
      console.log(train);
      if (train.eigenschaft === "angriff") column = "angriff";
      else if (train.eigenschaft === "verteidigung") column = "verteidigung";
      else if (train.eigenschaft === "gesundheit") column = "max_leben";

      let column2;
      if (train.eigenschaft === "angriff") column2 = "angriff_durch_training";
      else if (train.eigenschaft === "verteidigung") column2 = "verteidigung_durch_training";
      else if (train.eigenschaft === "gesundheit") column2 = "gesundheit_durch_training";

      if (column) {
        await pool.query(
          `UPDATE spieler SET ${column} = ${column} + 1, ${column2} = ${column2} + 1 WHERE user_id = $1`,
          [train.user_id]
        );
      }

      // Training beenden
      await pool.query(
        `DELETE FROM training WHERE id = $1`,
        [train.id]
      );

      console.log(`✅ Training abgeschlossen für Spieler ${train.user_id}: ${train.eigenschaft} +1`);
    }

    console.log(`✅ Abgeschlossen: ${trainings.rowCount} Trainings`);
  } catch (err) {
    console.error("❌ Fehler beim Abschließen von Trainings:", err);
  }
}
