import fs from "fs";
import brain from "brain.js";

let model;
try {
  const modelJSON = JSON.parse(fs.readFileSync("src/utils/bot-model.json", "utf8"));
  model = new brain.NeuralNetwork();
  model.fromJSON(modelJSON);
} catch (err) {
  console.error("❌ Bot-Model konnte nicht geladen werden:", err.message);
}

export function decideNextSkill(skillung) {
  if (!model) return { nextSkill: "angriff", expectedWin: 0 };

  if (Math.random() < 0.4) {
    const allProps = Object.keys(skillung);
    const randomSkill = allProps[Math.floor(Math.random() * allProps.length)];
    console.log("✅ Zufall gewählt:", randomSkill);
    return { nextSkill: randomSkill, expectedWin: 0 };
  }

  let bestProp = null;
  let bestScore = -Infinity;

  for (let prop of Object.keys(skillung)) {
    const testSkillung = { ...skillung, [prop]: skillung[prop] + 1 };
    const prediction = model.run(testSkillung);
    const winChance = prediction.win;
    if (winChance > bestScore) {
      bestScore = winChance;
      bestProp = prop;
    }
  }
  console.log("✅ KI hat gewählt:", bestProp);
  return { nextSkill: bestProp, expectedWin: bestScore };
}


