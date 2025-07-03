import pool from '../db/db.js';

export async function checkErfolgeNachKampf(userId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM spieler WHERE user_id = $1",
      [userId]
    );
    const spieler = rows[0];
    if (!spieler) return;

    // Prüfen Kämpfe
    if (spieler.kaempfe_insgesamt >= 1)  await checkAndAddErfolg(1, userId);
    if (spieler.kaempfe_insgesamt >= 10) await checkAndAddErfolg(2, userId);
    if (spieler.kaempfe_insgesamt >= 50) await checkAndAddErfolg(3, userId);
    if (spieler.kaempfe_insgesamt >= 100) await checkAndAddErfolg(4, userId);
    if (spieler.kaempfe_insgesamt >= 500) await checkAndAddErfolg(5, userId);

    // Prüfen Siege
    if (spieler.siege >= 1)  await checkAndAddErfolg(6, userId);
    if (spieler.siege >= 10) await checkAndAddErfolg(7, userId);
    if (spieler.siege >= 50) await checkAndAddErfolg(8, userId);
    if (spieler.siege >= 100) await checkAndAddErfolg(9, userId);
    if (spieler.siege >= 500) await checkAndAddErfolg(10, userId);

    // Prüfen Niederlagen
    if (spieler.niederlagen >= 1)  await checkAndAddErfolg(11, userId);
    if (spieler.niederlagen >= 10) await checkAndAddErfolg(12, userId);
    if (spieler.niederlagen >= 50) await checkAndAddErfolg(13, userId);
    if (spieler.niederlagen >= 100) await checkAndAddErfolg(14, userId);
    if (spieler.niederlagen >= 500) await checkAndAddErfolg(15, userId);

       // Prüfen SiegeInFolge
    if (spieler.siege_in_folge >= 5)  await checkAndAddErfolg(16, userId);
    if (spieler.siege_in_folge  >= 10) await checkAndAddErfolg(17, userId);
    if (spieler.siege_in_folge  >= 15) await checkAndAddErfolg(18, userId);
    if (spieler.siege_in_folge  >= 20) await checkAndAddErfolg(19, userId);
    if (spieler.siege_in_folge  >= 50) await checkAndAddErfolg(20, userId);

         // Prüfen GesamtSchaden ausgeteilt
    if (spieler.gesamt_schaden_ausgeteilt >= 500)  await checkAndAddErfolg(21, userId);
    if (spieler.gesamt_schaden_ausgeteilt >= 1000) await checkAndAddErfolg(22, userId);
    if (spieler.gesamt_schaden_ausgeteilt >= 5000) await checkAndAddErfolg(23, userId);
    if (spieler.gesamt_schaden_ausgeteilt >= 10000) await checkAndAddErfolg(24, userId);
    if (spieler.gesamt_schaden_ausgeteilt >= 50000) await checkAndAddErfolg(25, userId);

    //kritische_Treffer
    if (spieler.kritische_treffer >= 5)  await checkAndAddErfolg(26, userId);
    if (spieler.kritische_treffer >= 10) await checkAndAddErfolg(27, userId);
    if (spieler.kritische_treffer >= 50) await checkAndAddErfolg(28, userId);
    if (spieler.kritische_treffer >= 100) await checkAndAddErfolg(29, userId);
    if (spieler.kritische_treffer >= 500) await checkAndAddErfolg(30, userId);

     //ausgewischen
    if (spieler.ausgewischen >= 10)  await checkAndAddErfolg(31, userId);
    if (spieler.ausgewischen >= 50) await checkAndAddErfolg(32, userId);
    if (spieler.ausgewischen >= 100) await checkAndAddErfolg(33, userId);
    if (spieler.ausgewischen >= 500) await checkAndAddErfolg(34, userId);
    if (spieler.ausgewischen >= 1000) await checkAndAddErfolg(35, userId);

    //Doppelschlag
    if (spieler.doppelschlag_gemacht >= 10)  await checkAndAddErfolg(36, userId);
    if (spieler.doppelschlag_gemacht >= 50) await checkAndAddErfolg(37, userId);
    if (spieler.doppelschlag_gemacht >= 100) await checkAndAddErfolg(38, userId);
    if (spieler.doppelschlag_gemacht >= 500) await checkAndAddErfolg(39, userId);
    if (spieler.doppelschlag_gemacht >= 1000) await checkAndAddErfolg(40, userId);

     //xp
    if (spieler.xp >= 1000)  await checkAndAddErfolg(41, userId);
    if (spieler.xp >= 5000) await checkAndAddErfolg(42, userId);
    if (spieler.xp >= 10000) await checkAndAddErfolg(43, userId);
    if (spieler.xp >= 50000) await checkAndAddErfolg(44, userId);
    if (spieler.xp >= 100000) await checkAndAddErfolg(45, userId);

    //Coins
    if (spieler.gesamt_coins_verdient >= 1000)  await checkAndAddErfolg(46, userId);
    if (spieler.gesamt_coins_verdient >= 5000) await checkAndAddErfolg(47, userId);
    if (spieler.gesamt_coins_verdient >= 10000) await checkAndAddErfolg(48, userId);
    if (spieler.gesamt_coins_verdient >= 50000) await checkAndAddErfolg(49, userId);
    if (spieler.gesamt_coins_verdient >= 100000) await checkAndAddErfolg(50, userId);

     //Kampfstaub
    if (spieler.gesamt_kampfstaub_verdient >= 5000)  await checkAndAddErfolg(56, userId);
    if (spieler.gesamt_kampfstaub_verdient >= 10000) await checkAndAddErfolg(57, userId);
    if (spieler.gesamt_kampfstaub_verdient >= 50000) await checkAndAddErfolg(58, userId);
    if (spieler.gesamt_kampfstaub_verdient >= 100000) await checkAndAddErfolg(59, userId);
    if (spieler.gesamt_kampfstaub_verdient >= 200000) await checkAndAddErfolg(60, userId);

     //geblockter Schaden
    if (spieler.geblockter_schaden >= 100)  await checkAndAddErfolg(66, userId);
    if (spieler.geblockter_schaden >= 500) await checkAndAddErfolg(67, userId);
    if (spieler.geblockter_schaden >= 1000) await checkAndAddErfolg(68, userId);
    if (spieler.geblockter_schaden >= 5000) await checkAndAddErfolg(69, userId);
    if (spieler.geblockter_schaden >= 10000) await checkAndAddErfolg(70, userId);

      //Schaden mit einem Schlag
    if (spieler.höchster_schaden_mit_einem_schlag >= 20)  await checkAndAddErfolg(71, userId);
    if (spieler.höchster_schaden_mit_einem_schlag >= 40) await checkAndAddErfolg(72, userId);
    if (spieler.höchster_schaden_mit_einem_schlag >= 60) await checkAndAddErfolg(73, userId);
    if (spieler.höchster_schaden_mit_einem_schlag >= 80) await checkAndAddErfolg(74, userId);
    if (spieler.höchster_schaden_mit_einem_schlag >= 100) await checkAndAddErfolg(75, userId);

  } catch (err) {
    console.error("Fehler bei checkErfolgeNachKampf:", err);
    throw err;
  }
}


export async function checkErfolgeNachKauf(userId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM spieler WHERE user_id = $1",
      [userId]
    );
    const spieler = rows[0];
    if (!spieler) return;

    // Coins ausgegeben
    if (spieler.coins_ausgegeben >= 10000)  await checkAndAddErfolg(51, userId);
    if (spieler.coins_ausgegeben >= 50000) await checkAndAddErfolg(52, userId);
    if (spieler.coins_ausgegeben >= 100000) await checkAndAddErfolg(53, userId);
    if (spieler.coins_ausgegeben >= 500000) await checkAndAddErfolg(54, userId);
    if (spieler.coins_ausgegeben >= 1000000) await checkAndAddErfolg(55, userId);

       // Items gekauft
    if (spieler.items_gekauft >= 1)  await checkAndAddErfolg(76, userId);
    if (spieler.items_gekauft >= 10) await checkAndAddErfolg(77, userId);
    if (spieler.items_gekauft >= 50) await checkAndAddErfolg(78, userId);
    if (spieler.items_gekauft >= 100) await checkAndAddErfolg(79, userId);
    if (spieler.items_gekauft >= 500) await checkAndAddErfolg(80, userId);

 } catch (err) {
    console.error("Fehler bei checkErfolgeNachKampf:", err);
    throw err;
  }
}

export async function checkErfolgeNachCraft(userId) {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM spieler WHERE user_id = $1",
      [userId]
    );
    const spieler = rows[0];
    if (!spieler) return;

  
       // Items erstellt
    if (spieler.items_gecraftet >= 1)  await checkAndAddErfolg(61, userId);
    if (spieler.items_gecraftet >= 10) await checkAndAddErfolg(62, userId);
    if (spieler.items_gecraftet >= 50) await checkAndAddErfolg(63, userId);
    if (spieler.items_gecraftet >= 100) await checkAndAddErfolg(64, userId);
    if (spieler.items_gecraftet >= 500) await checkAndAddErfolg(65, userId);

 } catch (err) {
    console.error("Fehler bei checkErfolgeNachKampf:", err);
    throw err;
  }
}




export async function checkAndAddErfolg(erfolgId, userId) {
  try {
    // Prüfen ob Spieler den Erfolg schon hat
    const { rows } = await pool.query(
      "SELECT 1 FROM erfolge_ref WHERE user_id = $1 AND erfolg_id = $2",
      [userId, erfolgId]
    );

    if (rows.length > 0) {
      return false; // Erfolg schon vorhanden
    }


    const erfolg  = await pool.query(
      "SELECT * FROM erfolge WHERE id = $1 ",
      [erfolgId]
    );
    const belohnungen = erfolg.rows[0];
    const datum = Math.floor(Date.now() / 1000);

    // Erfolg eintragen
    await pool.query(
      "INSERT INTO erfolge_ref (user_id, erfolg_id, datum) VALUES ($1, $2, $3)",
      [userId, erfolgId, datum]
    );

    // Nachricht an Spieler
    await pool.query(
      `INSERT INTO nachrichten (von_id, an_id, betreff, text, datum, gelesen)
       VALUES (0, $1, $2, $3, $4, false)`,
      [
        userId,
        "Meilenstein",
        "Du hast einen Meilenstein erreicht und neue Belohnungen freigeschaltet.",
        datum
      ]
    );

    // Belohnung speichern

    await pool.query(
      "INSERT INTO designs_ref (userid, designid) VALUES ($1, $2)",
      [userId, belohnungen.belohnung1]
    );
    await pool.query(
      "INSERT INTO designs_ref (userid, designid) VALUES ($1, $2)",
      [userId, belohnungen.belohnung2]
    );


    return true;
  } catch (err) {
    console.error("Fehler bei checkAndAddErfolg:", err);
    throw err;
  }
}
