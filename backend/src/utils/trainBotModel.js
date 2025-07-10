// src/utils/trainBotModel.js
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import brain from "brain.js";
import pool from "../db/db.js";

function extractAttributes(kampf, prefix) {
  return {
    angriff: kampf[`${prefix}angriff`] || 0,
    krit_chance: kampf[`${prefix}krit_chance`] || 0,
    krit_schaden: kampf[`${prefix}krit_schaden`] || 0,
    doppelschlag: kampf[`${prefix}doppelschlag`] || 0,
    ausweichen: kampf[`${prefix}ausweichen`] || 0,
    verteidigen: kampf[`${prefix}verteidigen`] || 0,
    leben_pro_treffer: kampf[`${prefix}leben_pro_treffer`] || 0,
    max_leben: kampf[`${prefix}max_leben`] || 0,
    gluck: kampf[`${prefix}gluck`] || 0,
    mehr_kampfstaub: kampf[`${prefix}mehr_kampfstaub`] || 0,
    mehr_xp: kampf[`${prefix}mehr_xp`] || 0,
    mehr_coins: kampf[`${prefix}mehr_coins`] || 0
  };
}

export async function retrainBotModel() {
  const { rows } = await pool.query("SELECT * FROM kaempfe"); // <-- hier fix

  const data = [];
  for (let kampf of rows) {
    const winnerInput = kampf.gewinner_id === kampf.spieler1_id
      ? extractAttributes(kampf, "spieler1_")
      : extractAttributes(kampf, "spieler2_");

    const loserInput = kampf.gewinner_id === kampf.spieler1_id
      ? extractAttributes(kampf, "spieler2_")
      : extractAttributes(kampf, "spieler1_");

    data.push({ input: winnerInput, output: { win: 1 } });
    data.push({ input: loserInput, output: { win: 0 } });
  }

  const net = new brain.NeuralNetwork({ hiddenLayers: [12,8] });
  net.train(data, { iterations: 5000, log: true, logPeriod: 500 });
  fs.writeFileSync("src/utils/bot-model.json", JSON.stringify(net.toJSON()));
  console.log("✅ Modell gespeichert unter src/utils/bot-model.json");
}
