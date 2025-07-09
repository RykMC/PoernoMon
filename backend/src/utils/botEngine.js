import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5000/api",
});

const attributes = [
  "angriff",
  "krit_chance",
  "krit_schaden",
  "doppelschlag",
  "verteidigen",
  "ausweichen",
  "leben_pro_treffer",
  "max_leben",
  "gluck",
  "mehr_kampfstaub",
  "mehr_xp",
  "mehr_coins"
];

function getRandomAttribute() {
  return attributes[Math.floor(Math.random() * attributes.length)];
}



function sumItemStats(item) {
  return (item.bonus1wert || 0) + (item.bonus2wert || 0) + (item.bonus3wert || 0);
}

function getUniqueBotEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const randomChar = chars[Math.floor(Math.random() * chars.length)];
  const randomNum = Math.floor(Math.random() * 1000); 
  return `${randomChar}${randomNum}@test.de`;
}

async function loginBot(email, password) {
    try {
        const res = await api.post("/auth/login", { email, password });
        console.log(`✅ Eingeloggt als ${email}`);
        return res.data.token;
    } catch (err) {
        console.error(`❌ Login fehlgeschlagen für ${email}`, err.response?.data || err);
        return null;
    }
}

async function getRandomBotEmail() {
  try {
    const res = await api.get("/auth/botEmail", {

    });
    return res.data.email;
  } catch (err) {
    console.error("❌ Fehler beim Laden eines Bot-Accounts:", err.response?.data || err);
    return null;
  }
}

async function getSpieler(token) {
    try {
        const res = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } 
        });
        return res.data.spieler;
    } catch (err) {
        console.error("❌ Fehler beim Laden von /me:", err.response?.data || err);
        return null;
    }
}

async function equipItem(token, itemId, typ) {
  try {
    await api.post("/items/equip",
      { slot: typ, itemId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`🛡️ Item ${itemId} (${typ}) angelegt`);
  } catch (err) {
    console.error(`❌ Fehler beim Anlegen von Item ${itemId}:`, err.response?.data || err);
  }
}

async function moveToShop(token, itemId) {
  try {
   const res = await api.post(`/items/${itemId}/destroy`,
      { preis: 300 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(res.data.message);
  } catch (err) {
    console.error(`❌ Fehler beim Verkaufen von Item ${itemId}:`, err.response?.data || err);
  }
}

async function skillLoop(token, skillpunkte) {
  while (skillpunkte > 0) {
    const randomAttr = getRandomAttribute();
    await api.post("/poernomon/skill",
      { eigenschaft: randomAttr },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Geskillt: ${randomAttr}`);
    skillpunkte--;
  }
}

async function handleItemDecision(token, newItem) {
  const items = await api.get("/items/",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Läuft bisher`);
    const itemsd = items.data;
    const existing = itemsd.find(item => item.typ === newItem.typ && item.angelegt === 1);

    const newSum = sumItemStats(newItem);
    const oldSum = existing ? sumItemStats(existing) : 0;

    if (!existing) {
        await equipItem(token, newItem.id, newItem.typ);
    } else if (newSum > oldSum) {
        await moveToShop(token, existing.id);
        await equipItem(token, newItem.id, newItem.typ);
    } else {
        await moveToShop(token, newItem.id);
    }
}

async function maybeChangeDesign(token) {
  if (Math.random() < 0.1) {
    console.log("🎨 Bot möchte Design ändern...");

    try {
      const res = await api.get("/design/my-designs", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const frames = res.data.frames || [];
      const backgrounds = res.data.backgrounds || [];

      if (backgrounds.length > 0) {
        const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)].id;
        await api.post("/design/select",
          { type: "background", designId: randomBg },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`🌌 Hintergrund gewechselt zu ID ${randomBg}`);
      }

      if (frames.length > 0) {
        const randomFrame = frames[Math.floor(Math.random() * frames.length)].id;
        await api.post("/design/select",
          { type: "frame", designId: randomFrame },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`🖼️ Frame gewechselt zu ID ${randomFrame}`);
      }

    } catch (err) {
      console.error("❌ Fehler beim Design-Wechsel:", err.response?.data || err);
    }
  }
}

async function cleanUpBotMessages(token) {
  try {
    const res = await api.get("/nachrichten", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const nachrichten = res.data;
    
    for (let n of nachrichten) {
      await api.delete(`/nachrichten/${n.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`🗑️ Nachricht ${n.id} gelöscht`);
    }

    if (nachrichten.length > 0) {
      console.log(`✉️ Bot hatte ${nachrichten.length} Nachrichten, alle gelöscht.`);
    }

  } catch (err) {
    console.error("❌ Fehler beim Nachrichten-Cleanup:", err.response?.data || err);
  }
}

async function handleTraining(token) {
  try {
    const res = await api.get("/training", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const training = res.data.training[0];

    if (training) {
      console.log("Training:", training.aktiv, training.eigenschaft);
      if (training.aktiv === 0) {
        // wieder aufnehmen
        await api.post("/training/start", { eigenschaft: training.eigenschaft }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`▶️ Training in ${training.eigenschaft} wieder aufgenommen.`);
      } else {
        console.log(`🚀 Training läuft bereits in ${training.eigenschaft}.`);
      }
    } else {
      // neues Training starten
      const eigenschaften = ["angriff", "verteidigen", "gesundheit"];
      const eigenschaft = eigenschaften[Math.floor(Math.random() * eigenschaften.length)];
      await api.post("/training/start", { eigenschaft } , {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`🏋️ Neues Training gestartet in ${eigenschaft}.`);
    }

  } catch (err) {
    console.error("❌ Fehler beim Training:", err.response?.data || err);
  }
}


async function createNewBot() {
  const email = getUniqueBotEmail();
  const password = process.env.BOT_LOGIN_PASSWORD;

  try {
    await api.post("/auth/register", { email, password });
    console.log(`🎉 Neuer Bot registriert: ${email}`);

    // direkt einloggen, um Token zu holen
    const loginRes = await api.post("/auth/login", { email, password });
    const token = loginRes.data.token;

    // zufälligen Namen aus DB holen
    const nameRes = await api.get("/auth/random-name", {
      headers: { Authorization: `Bearer ${token}` }
    });
   

    console.log(`🐣 Neuer Bot ${email} heißt jetzt ${nameRes}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen/Setzen des Bots ${email}:`, err.response?.data || err);
  }
}

async function fightBot(token, leben) {
  if (leben < 30) {
    console.log("😴 Nicht genug Leben zum Kämpfen.");
    return;
  }

  try {
    const res = await api.post("/fight/matchmaking", {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`⚔️ Kampf gestartet & gespeichert:`, res.data);
    if (res.data.level3_erreicht) {
        console.log(`🚀 Einer hat Level 3 erreicht. Neuer Bot wird erstellt...`);
        await createNewBot();
        }
  } catch (err) {
    console.error("❌ Kampf-API Fehler:", err.response?.data || err);
  }
}

async function craftBot(token, kampfstaub) {
  if (kampfstaub < 500) {
    console.log("😴 Nicht genug Kampfstaub zum Craften.");
    return;
  }

  try {
    const res = await api.post("/items/craft", {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const newItem = res.data.item;
    console.log(`🎉 Item gecraftet: ${newItem.typ} (ID ${newItem.id})`);
    await handleItemDecision(token, newItem);
  } catch (err) {
    console.error("❌ Craft-API Fehler:", err.response?.data || err);
  }
}


async function runBot() {
  const email = await getRandomBotEmail();
  const token = await loginBot(email, process.env.BOT_LOGIN_PASSWORD);
  if (!token) return;

  const spieler = await getSpieler(token);
  if (!spieler) {
    console.error("❌ Spieler konnte nicht geladen werden");
    return;
  }

  console.log(`🎯 Spieler hat ${spieler.skillpunkte} Skillpunkte`);

  if (spieler.skillpunkte > 0) {
    await skillLoop(token, spieler.skillpunkte);
    console.log(`🚀 Alle Skillpunkte verteilt für ${email}`);
  }

  await fightBot(token, spieler.leben);
  await craftBot(token, spieler.kampfstaub);
  await maybeChangeDesign(token);
  await cleanUpBotMessages(token);
  await handleTraining(token);

}

export default runBot;
