// Kampflogik zwischen zwei Spielern
import pool from "../db/db.js";


export async function simulateFight(spieler1, spieler2) {
  let runde = 1;
  let s1 = { ...spieler1 };
  let s2 = { ...spieler2 };

       
  const stats = {
    [s1.user_id]: {
      siege: 0,
      niederlagen: 0,
      siege_in_folge: 0,
      niederlagen_in_folge: 0,
      höchster_schaden_mit_einem_schlag: 0,
      höchste_siege_in_folge: 0,
      höchste_niederlagen_in_folge: 0,
      gesamt_schaden_ausgeteilt: 0,
      gesamt_schaden_erhalten: 0,
      geblockter_schaden: 0,
      kritische_treffer: 0,
      kritische_treffer_erhalten: 0,
      ausgewichen: 0,
      angriffe_verfehlt: 0,
      kampfstaub_verdient: 0,
      gesamt_coins_verdient: 0,
      höchste_xp_in_einem_kampf: 0,
      höchster_gewinn_in_coins: 0,
      kaempfe_insgesamt: 1
    },
    [s2.user_id]: {
      siege: 0,
      niederlagen: 0,
      siege_in_folge: 0,
      niederlagen_in_folge: 0,
      höchster_schaden_mit_einem_schlag: 0,
      höchste_siege_in_folge: 0,
      höchste_niederlagen_in_folge: 0,
      gesamt_schaden_ausgeteilt: 0,
      gesamt_schaden_erhalten: 0,
      geblockter_schaden: 0,
      kritische_treffer: 0,
      kritische_treffer_erhalten: 0,
      ausgewichen: 0,
      angriffe_verfehlt: 0,
      kampfstaub_verdient: 0,
      gesamt_coins_verdient: 0,
      höchste_xp_in_einem_kampf: 0,
      höchster_gewinn_in_coins: 0,
      kaempfe_insgesamt: 1
    }
  };

    const texte = {

   start: [
    "{name} springt vor und hebt die Waffe...",
    "{name} stürmt entschlossen auf den Gegner zu...",
    "{name} zieht seine Klinge zurück und geht in Stellung...",
    "{name} baut Druck auf und stößt vor...",
    "Mit grimmigem Blick geht {name} in die Offensive...",
    "{name} holt weit aus und zielt auf eine Schwachstelle...",
    "{name} schleicht einen Schritt näher und setzt zum Hieb an...",
    "Mit einem Kampfschrei rennt {name} auf den Gegner zu...",
    "{name} sammelt all seine Kraft für einen mächtigen Schlag...",
    "{name} visiert sein Ziel an und hebt die Waffe...",
    "Plötzlich stürmt {name} los und will zuschlagen...",
    "{name} atmet tief ein und stößt sich vom Boden ab...",
    "Mit wütendem Knurren rast {name} nach vorn...",
    "{name} zieht blitzschnell die Hand hoch, bereit zum Schlag...",
    "Sein Blick fokussiert, holt {name} aus...",
    "{name} senkt den Kopf und rennt los...",
    "Ein kurzer Zucken seiner Muskeln, dann schnellt {name} vor...",
    "Mit einem Satz nach vorne setzt {name} zum Angriff an...",
    "{name} grinst böse, bevor er zum Schlag ausholt...",
    "Ohne Zögern eilt {name} auf den Gegner zu, die Waffe erhoben..."
  ],

    ausweichen: [
      "{name} springt blitzartig zurück und entgeht knapp dem Hieb!",
      "{name} rollt sich geschickt zur Seite und der Angriff zischt vorbei.",
      "Mit einem schnellen Schritt zur Seite entkommt {name} dem Schlag.",
      "{name} taucht unter dem Hieb hindurch und lacht auf.",
      "{name} dreht sich elegant weg und der Treffer geht ins Leere.",
      "Geistesgegenwärtig springt {name} zurück und vermeidet den Treffer.",
      "{name} wirbelt herum und der Schlag trifft nur Luft.",
      "Der Angriff schrammt haarscharf vorbei – {name} war gerade schnell genug.",
      "{name} macht einen Satz zur Seite und entgeht so dem Treffer.",
      "{name} duckt sich blitzschnell – der Schlag rauscht über ihn hinweg.",
      "Gerade noch rechtzeitig weicht {name} aus und rettet seine Haut.",
      "Ein kurzer Sprung nach hinten, und {name} ist außer Reichweite.",
      "{name} neigt den Oberkörper und der Hieb zischt ungefährlich vorbei.",
      "{name} macht einen waghalsigen Hechtsprung und entkommt so dem Angriff.",
      "Der Gegner schlägt zu, doch {name} tanzt aus der Reichweite.",
      "{name} dreht sich geschickt weg – der Angriff verpufft ins Nichts.",
      "Ein Ausfallschritt nach rechts, und {name} entkommt dem Schlag.",
      "{name} schlängelt sich mit flinken Bewegungen davon.",
      "{name} zieht hastig den Kopf ein und entgeht so dem Angriff.",
      "Mit erstaunlicher Reaktion dreht sich {name} seitlich weg und bleibt unverletzt."
    ],
    blockiert: [
      "{name} reißt den Schild hoch und fängt den Schlag ab.",
      "Mit einem lauten Krachen blockt {name} den Hieb.",
      "{name} stellt sich breit hin und pariert den Angriff mühelos.",
      "Der Schlag prallt wirkungslos an {name}s Verteidigung ab.",
      "{name} stoppt den Angriff mit einer präzisen Parade.",
      "Mit hochgezogenen Armen lenkt {name} den Angriff ab.",
      "{name} lässt den Schlag an seinem Schild abgleiten.",
      "Schnell reagierend, fängt {name} den Angriff mit einer Parade ab.",
      "{name} hält stand und blockt die Attacke souverän.",
      "Ein dumpfer Schlag ertönt, als {name} den Angriff stoppt.",
      "{name} stemmt sich dagegen und wehrt den Schlag kraftvoll ab.",
      "Die Waffe prallt hart an {name}s Block ab.",
      "{name} spannt die Muskeln an und hält dem Treffer stand.",
      "Mit einer schnellen Bewegung blockt {name} den Schlag.",
      "{name} fängt die Wucht des Angriffs mit einem festen Stand ab.",
      "Wie ein Fels blockt {name} den Angriff.",
      "Ein metallisches Klirren ertönt, als {name} pariert.",
      "{name} zuckt nicht einmal, als er den Angriff souverän abwehrt.",
      "Der Angreifer prallt an {name}s Verteidigung ab.",
      "Mit geübtem Griff lenkt {name} die Klinge zur Seite."
    ],
    treffer: [
      "{name} wird getroffen und schreit vor Schmerz auf.",
      "{name} kassiert einen Treffer!",
      "Der Schlag sitzt. {name} taumelt zurück.",
      "{name} zuckt zusammen, Blut spritzt.",
      "Autsch! {name} wird hart erwischt.",
      "Ein dumpfer Schlag trifft {name} mitten ins Gesicht.",
      "{name} japst nach Luft – das hat wehgetan.",
      "Der Hieb reißt {name} von den Füßen.",
      "{name} wankt, die Augen flackern.",
      "Ein Treffer direkt in die Seite von {name}.",
      "Das Krachen der Knochen von {name} ist nicht zu überhören.",
      "{name} wird rücklings gegen eine imaginäre Wand geschleudert.",
      "Ein Schlag in die Magengrube – {name} krümmt sich.",
      "{name} keucht, während Blut auf den Boden tropft.",
      "{name} greift sich an die Wunde und faucht.",
      "Ein sauberer Treffer! {name} spuckt Blut.",
      "{name} brüllt wütend auf, trotz des Schmerzes.",
      "Das Schwert ritzt {name} über die Brust.",
      "{name} wankt, seine Schritte unsicher.",
      "Die Wucht des Treffers lässt {name} kurz das Bewusstsein verlieren."
    ],
    krit: [
      "Kritischer Schlag! {name} wird mit voller Wucht getroffen und bricht fast zusammen.",
      "Ein verheerender Krit! {name} röchelt, Blut läuft ihm aus dem Mund.",
      "Kritisch getroffen – {name} sackt mit glasigen Augen zusammen.",
      "Ein tödlicher Hieb zerreißt {name}s Rüstung und Fleisch gleichermaßen.",
      "Kritisch! Der Schlag lässt {name} benommen taumeln, kaum bei Bewusstsein.",
      "Ein brutaler Krit trifft {name} genau am Kopf – Sterne tanzen vor seinen Augen.",
      "Kritischer Treffer! {name}s Beine geben nach, er fällt schwer atmend auf die Knie.",
      "Das war ein kritischer Treffer ins Mark – {name} windet sich schmerzverzerrt.",
      "Ein gnadenloser Krit zertrümmert {name}s Schild und schlitzt die Seite auf.",
      "Kritisch! {name} schreit auf, als Knochen unter dem Druck nachgeben.",
      "Ein kritischer Schlag trifft {name} in die Rippen – ein hässliches Knacken ertönt.",
      "Kritischer Treffer direkt in die Brust! {name} japst nach Luft.",
      "Ein blutiger Krit reißt tiefe Wunden in {name}s Körper.",
      "Kritisch! {name} spuckt Blut und taumelt gefährlich nahe an den Abgrund.",
      "Ein wilder Krit zerfetzt {name}s Schulter – er lässt die Waffe fallen.",
      "Kritischer Hieb! {name}s Augen weiten sich vor Schmerz und Angst.",
      "Ein bösartiger Krit bohrt sich tief in {name}s Fleisch.",
      "Kritisch getroffen! {name} wankt und greift instinktiv nach der klaffenden Wunde.",
      "Ein grausamer Krit lässt {name} wie eine Puppe zusammensacken.",
      "Kritischer Treffer! {name} wird meterweit nach hinten geschleudert."
    ],
    heilung: [
      "{name} spürt, wie neue Kraft durch seinen Körper strömt.",
      "Ein leises Aufatmen – {name} regeneriert etwas Lebensenergie.",
      "{name} zieht Stärke aus dem Kampf und heilt sich leicht.",
      "Wärme breitet sich aus, {name} fühlt sich wieder etwas besser.",
      "{name}s Wunden schließen sich minimal, er steht wieder stabiler.",
      "Ein schwaches Leuchten umgibt {name}, als er etwas Gesundheit zurückgewinnt.",
      "{name} sammelt sich kurz und tankt neue Lebensenergie.",
      "Ein Teil des erlittenen Schadens wird von {name} abgeschüttelt.",
      "{name} reißt sich zusammen und spürt frische Energie.",
      "Blut rinnt langsamer – {name}s Körper regeneriert sich leicht.",
      "{name} atmet tief durch, die Lebensgeister regen sich.",
      "Ein Funken Vitalität kehrt zurück in {name}s Augen.",
      "{name} richtet sich etwas auf und sieht weniger angeschlagen aus.",
      "Durch den Adrenalinschub heilen kleine Wunden bei {name}.",
      "Ein Ruck geht durch {name}s Körper, er wirkt gestärkter.",
      "Das Blut stillt sich, {name} gewinnt ein kleines Stück Gesundheit zurück.",
      "{name} fokussiert sich und regeneriert ein bisschen.",
      "Ein kurzer Moment der Ruhe gibt {name} ein wenig Lebensenergie zurück.",
      "{name} zittert kurz, dann stabilisiert sich sein Zustand.",
      "Der Schmerz weicht leicht – {name} kann wieder besser atmen."
    ],
    doppelschlag: [
      "{name} wittert die Gelegenheit und setzt sofort nach!",
      "Ohne Atempause schlägt {name} ein zweites Mal zu!",
      "{name} lässt dem Gegner keine Zeit zum Reagieren und greift erneut an.",
      "Mit blitzartiger Geschwindigkeit attackiert {name} gleich nochmal.",
      "{name} drängt den Gegner mit einem weiteren Angriff zurück!",
      "Wie von einer unsichtbaren Kraft getrieben führt {name} einen zweiten Schlag aus.",
      "Der Kampfrausch packt {name} – er stürmt sofort wieder vor.",
      "{name} macht keine Pause und holt direkt zum nächsten Hieb aus.",
      "Ein gnadenloser Doppelschlag von {name} trifft den Gegner unvorbereitet.",
      "Noch bevor der erste Schlag ganz verpufft ist, folgt {name} mit einem weiteren.",
      "Ohne zu zögern hämmert {name} ein zweites Mal drauf.",
      "{name} nutzt den Schwung für einen weiteren Angriff.",
      "Eiskalt nutzt {name} die Deckungslücke für einen Folgeangriff.",
      "Der Gegner kann kaum reagieren, so schnell schlägt {name} nochmal zu.",
      "{name} dreht sich mit einer fließenden Bewegung und trifft erneut.",
      "Getrieben vom Adrenalin setzt {name} direkt nach.",
      "Wie entfesselt führt {name} einen zusätzlichen Schlag aus.",
      "{name} wirbelt herum und landet gleich noch einen Treffer.",
      "Kaum hat der erste Hieb sein Ziel gefunden, folgt der nächste.",
      "Ein kurzer Aufschrei – {name} trifft den Gegner erneut mit voller Wucht."
    ],
    verlierer: [
      "{name} geht schwer getroffen zu Boden.",
        "{name} bricht unter Schmerzen zusammen.",
        "{name} sinkt reglos in den Staub.",
        "Kein Laut mehr von {name}, der Kampf ist vorbei.",
        "{name} liegt besiegt am Boden.",
        "Mit glasigem Blick fällt {name} rückwärts.",
        "{name} sackt in sich zusammen und bleibt liegen.",
        "Die Beine geben nach – {name} stürzt.",
        "{name} kann nicht mehr und fällt um.",
        "{name} versucht noch zu stehen, bricht aber zusammen.",
        "{name} taumelt, verliert das Gleichgewicht und geht nieder.",
        "Völlig entkräftet sinkt {name} auf die Knie und kippt um.",
        "{name} wird von der Wucht zurückgeschleudert und bleibt liegen.",
        "Das war zu viel für {name}, er fällt leblos auf den Rücken.",
        "{name} versucht sich zu wehren, bricht dann aber endgültig zusammen.",
        "Mit einem dumpfen Aufprall schlägt {name} auf dem Boden auf.",
        "Keuchend greift {name} nach Luft und fällt.",
        "{name} verliert die Kraft in den Beinen und kippt.",
        "Der Blick von {name} wird leer, dann fällt er einfach um.",
        "{name} steht nicht mehr auf – er ist besiegt."
    ],
    ende: [
    "{name} reißt triumphierend die Fäuste in die Höhe.",
    "Mit einem letzten Hieb besiegt {name} seinen Gegner.",
    "{name} atmet schwer, aber ein Grinsen breitet sich auf seinem Gesicht aus.",
    "Der Kampf ist vorbei – {name} steht als Sieger da.",
    "{name} wirbelt herum und lässt den Blick über das Schlachtfeld gleiten.",
    "Mit funkelnden Augen wendet sich {name} vom besiegten Feind ab.",
    "Der Gegner liegt reglos am Boden, während {name} sich stolz aufrichtet.",
    "Ein erschöpftes Lächeln huscht über {name}s Gesicht.",
    "{name} klopft den Staub von seiner Rüstung und nickt zufrieden.",
    "Noch immer kampfbereit, blickt {name} über seine Schulter.",
    "{name} stößt einen lauten Jubelschrei aus.",
    "Mit einem kühlen Blick mustert {name} den gefallenen Gegner.",
    "{name} hebt sein Schwert zum Gruß – der Sieg gehört ihm.",
    "Der Boden ist übersät mit Spuren des Gefechts, aber {name} bleibt standhaft.",
    "Schweiß tropft von {name}s Stirn, doch er lächelt selbstbewusst.",
    "{name} streckt sich einmal durch und entspannt die Muskeln.",
    "Ohne ein weiteres Wort dreht sich {name} um und geht.",
    "{name} hebt die Arme, als wolle er sagen: 'Wer ist der Nächste?'",
    "Ein leises Lachen entringt sich {name}s Kehle, der Sieg schmeckt süß.",
    "{name} wischt das Blut von seiner Klinge und steckt sie weg."
  ]
  };



  const kampfInsert = await pool.query(
    "INSERT INTO kaempfe (spieler1_id, spieler2_id) VALUES ($1, $2) RETURNING id",
    [s1.user_id, s2.user_id]
  );
  const kampfId = kampfInsert.rows[0].id;

  const protokolliere = async (aktion, schaden, kommentar, angreiferId, verteidigerId) => {
    await pool.query(
      `INSERT INTO kampfverlauf (
        kampf_id, runde, angreifer_id, verteidiger_id, aktion, schaden,
        leben_verteidiger_nachher, leben_angreifer_nachher, kommentar
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        kampfId,
        runde,
        angreiferId,
        verteidigerId,
        aktion,
        schaden,
        verteidigerId === s1.user_id ? s1.leben : s2.leben, // Leben des Verteidigers NACHHER
        angreiferId === s1.user_id ? s1.leben : s2.leben,     // Leben des Angreifers NACHHER
        kommentar
      ]
    );
  };

  function randomText(category, name) {
    const list = texte[category];
    return list[Math.floor(Math.random() * list.length)].replace("{name}", name);
  }

    const angriff = async (angreifer, verteidiger) => {

    const zufall200 = () => Math.floor(Math.random() * 200) + 1;
    // Ausweichen prüfen
    const zufall = zufall200();
   // await protokolliere("wurf", 0, `${verteidiger.username} würfelt d100 (${zufall}) gegen Ausweichen (${verteidiger.ausweichen})`, angreifer.user_id, verteidiger.user_id);
    if ((verteidiger.ausweichen - verteidiger.glueck) < zufall) {
        stats[verteidiger.user_id].ausgewichen++;
        await protokolliere("ausgewichen", 0, randomText("ausweichen", verteidiger.username), angreifer.user_id, verteidiger.user_id);
        return;
      }
    

   // Angriffswurf
    const aWert = Math.floor(Math.random() * angreifer.angriff) + 10;
   // await protokolliere("wurf", 0, `${angreifer.username}  Angriff = ${aWert}`, angreifer.user_id, verteidiger.user_id);

    // Verteidigungswurf
    const vWert = Math.floor(Math.random() * verteidiger.verteidigen) + 1;
   // await protokolliere("wurf", 0, `${verteidiger.username} Verteidigung  = ${vWert}`, angreifer.user_id, verteidiger.user_id);

    if (aWert <= vWert) {
      stats[verteidiger.user_id].angriffe_verfehlt++;
      stats[verteidiger.user_id].geblockter_schaden += aWert; // weil alles geblockt
      await protokolliere("blockiert", 0, randomText("blockiert", verteidiger.username), angreifer.user_id, verteidiger.user_id);
      return;
    } else {
      stats[verteidiger.user_id].geblockter_schaden += vWert; // der Teil der weggeblockt wurde
    }

    // Kritisch?
    let istKrit = false;
    let schaden;
    const zufallKrit = zufall200();
   // await protokolliere("wurf", 0, `${angreifer.username} würfelt 200 (${zufallKrit}) gegen krit. Chance (${angreifer.krit_chance})`, angreifer.user_id, verteidiger.user_id);
    if ((angreifer.krit_chance - angreifer.glueck) < zufallKrit) {
      const krit_schaden = Math.floor(Math.random() * angreifer.krit_schaden) + 1;
      schaden = aWert + krit_schaden;
      istKrit = true;
    } else {
      schaden = aWert - vWert;
    }

    // Schaden abziehen
    if (verteidiger.user_id === s1.user_id) {
      s1.leben -= schaden;
    } else {
      s2.leben -= schaden;
    }

    await protokolliere(
      istKrit ? "krit" : "treffer",
      schaden,
      istKrit ? randomText("krit", verteidiger.username) : randomText("treffer", verteidiger.username),
      angreifer.user_id,
      verteidiger.user_id
    );
    stats[angreifer.user_id].gesamt_schaden_ausgeteilt += schaden;
    stats[verteidiger.user_id].gesamt_schaden_erhalten += schaden;
    stats[angreifer.user_id].höchster_schaden_mit_einem_schlag = Math.max(stats[angreifer.user_id].höchster_schaden_mit_einem_schlag || 0, schaden);
    if (istKrit) {
      stats[angreifer.user_id].kritische_treffer++;
      stats[verteidiger.user_id].kritische_treffer_erhalten++;
    }


    // Leben pro Treffer

      const zufallLpt = zufall200();
   //  await protokolliere("wurf", 0, `${angreifer.username} würfelt (${zufallLpt}) gegen Leben pro Treffer (${angreifer.leben_pro_treffer})`, angreifer.user_id, verteidiger.user_id);
    if ((angreifer.leben_pro_treffer - angreifer.glueck) < zufallLpt) {
        if (angreifer.user_id === s1.user_id) {
          s1.leben += 1;
        } else {
          s2.leben += 1;
        }
        await protokolliere("heilung", 0, randomText("heilung", angreifer.username), angreifer.user_id, verteidiger.user_id);
      }
    
  };

  while (s1.leben > 0 && s2.leben > 0) {
    await protokolliere("info", 0, randomText("start", s1.username), s1.user_id, s2.user_id);
    await angriff(s1, s2);
    if (s2.leben <= 0) break;

    if (s1.doppelschlag > 0) {
      const zufall = Math.floor(Math.random() * 200) + 1;
      if ((s1.doppelschlag - s1.glueck) < zufall) {
        await protokolliere("doppelschlag", 0, randomText("doppelschlag", s1.username), s1.user_id, s2.user_id);
        await angriff(s1, s2);
        if (s2.leben <= 0) break;
      }
    }

    await protokolliere("info", 0, randomText("start", s2.username), s2.user_id, s1.user_id);
    await angriff(s2, s1);
    if (s1.leben <= 0) break;

    if (s2.doppelschlag > 0) {
      const zufall = Math.floor(Math.random() * 200) + 1;
      if ((s2.doppelschlag - s2.glueck) < zufall) {
        await protokolliere("doppelschlag", 0, randomText("doppelschlag", s2.username), s2.user_id, s1.user_id);
        await angriff(s2, s1);
      }
    }

    runde++;
  }


  const gewinnerId = s1.leben > 0 ? s1.user_id : s2.user_id;
  const gewinnername = s1.leben > 0 ? s1.username : s2.username;
  const verlierername = s1.leben > 0 ? s2.username : s1.username;
  await pool.query("UPDATE kaempfe SET gewinner_id = $1 WHERE id = $2", [gewinnerId, kampfId]);
  await protokolliere("ENDE", 0, randomText("verlierer", verlierername), s1.user_id, s2.user_id);
  await protokolliere("ENDE", 0, randomText("ende", gewinnername), s2.user_id, s1.user_id);

 
  // --- Belohnungen berechnen ---
  const verlierer = s1.leben <= 0 ? s1 : s2;
  const gewinner = s1.leben > 0 ? s1 : s2;

  // Bonus-Faktoren
  const bonusXP = 1 + gewinner.mehr_xp / 100;
  const bonusStaub = 1 + gewinner.mehr_kampfstaub / 100;
  const bonusCoins = 1 + gewinner.mehr_coins / 100;

  // Werte berechnen
  const xpG = Math.floor((100 + Math.random() * 50) * bonusXP);
  const staubG = Math.floor((100 + Math.random() * 200) * bonusStaub);
  const coinsG = Math.floor((50 + Math.random() * 50) * bonusCoins);

  const xpV = Math.floor(Math.random() * 20);
  const staubV = Math.floor(Math.random() * 100);
  const coinsV = Math.floor(Math.random() * 50);
  const lebenG = Math.max(gewinner.leben, 0);
  const lebenV = Math.max(verlierer.leben, 0);

  // stats

  stats[gewinner.user_id].kampfstaub_verdient += staubG;
  stats[gewinner.user_id].gesamt_coins_verdient += coinsG;
  stats[gewinner.user_id].höchste_xp_in_einem_kampf = Math.max(stats[gewinner.user_id].höchste_xp_in_einem_kampf, xpG);
  stats[gewinner.user_id].höchster_gewinn_in_coins = Math.max(stats[gewinner.user_id].höchster_gewinn_in_coins, coinsG);

  stats[verlierer.user_id].kampfstaub_verdient += staubV;
  stats[verlierer.user_id].gesamt_coins_verdient += coinsV;
  stats[verlierer.user_id].höchste_xp_in_einem_kampf = Math.max(stats[verlierer.user_id].höchste_xp_in_einem_kampf, xpV);
  stats[verlierer.user_id].höchster_gewinn_in_coins = Math.max(stats[verlierer.user_id].höchster_gewinn_in_coins, coinsV);


  
// --- DB Updates & LevelUp ---
  // Gewinner zuerst
  await pool.query(`
  UPDATE spieler SET
    xp = xp + $1,
    kampfstaub = kampfstaub + $2,
    coins = coins + $3,
    leben = $4,
    siege = siege + 1,
    siege_in_folge = siege_in_folge + 1,
    niederlagen_in_folge = 0,
    höchste_siege_in_folge = GREATEST(höchste_siege_in_folge, siege_in_folge + 1),
    gesamt_schaden_ausgeteilt = gesamt_schaden_ausgeteilt + $5,
    gesamt_schaden_erhalten = gesamt_schaden_erhalten + $6,
    kritische_treffer = kritische_treffer + $7,
    kritische_treffer_erhalten = kritische_treffer_erhalten + $8,
    ausgewichen = ausgewichen + $9,
    angriffe_verfehlt = angriffe_verfehlt + $10,
    gesamt_kampfstaub_verdient = gesamt_kampfstaub_verdient + $11,
    gesamt_coins_verdient = gesamt_coins_verdient + $12,
    höchste_xp_in_einem_kampf = GREATEST(höchste_xp_in_einem_kampf, $13),
    höchster_gewinn_in_coins = GREATEST(höchster_gewinn_in_coins, $14),
    geblockter_schaden = geblockter_schaden + $15,
    höchste_kampfstaub_in_einem_kampf = GREATEST(höchste_kampfstaub_in_einem_kampf, $16),
    höchster_schaden_mit_einem_schlag = GREATEST(höchster_schaden_mit_einem_schlag, $17),
    kaempfe_insgesamt = kaempfe_insgesamt + 1
  WHERE user_id = $18

  `, [
    xpG, staubG, coinsG, lebenG,
    stats[gewinner.user_id].gesamt_schaden_ausgeteilt,
    stats[gewinner.user_id].gesamt_schaden_erhalten,
    stats[gewinner.user_id].kritische_treffer,
    stats[gewinner.user_id].kritische_treffer_erhalten,
    stats[gewinner.user_id].ausgewichen,
    stats[gewinner.user_id].angriffe_verfehlt,
    staubG,
    coinsG,
    xpG,
    coinsG,
    stats[gewinner.user_id].geblockter_schaden,
    staubG,
    stats[gewinner.user_id].höchster_schaden_mit_einem_schlag,
    gewinner.user_id
  ]);



// Level-Up prüfen (Gewinner)
const resG = await pool.query("SELECT xp, level FROM spieler WHERE user_id = $1", [gewinner.user_id]);
const { xp: aktuellerXP_G, level: aktuellesLevel_G } = resG.rows[0];

const nextLevelG = await pool.query("SELECT xp_benoetigt FROM levelstufen WHERE level = $1", [aktuellesLevel_G + 1]);
const xpNaechstesLevelG = nextLevelG.rows[0]?.xp_benoetigt;

if (xpNaechstesLevelG && aktuellerXP_G >= xpNaechstesLevelG) {
  await pool.query(`
    UPDATE spieler SET level = level + 1, skillpunkte = skillpunkte + 10 WHERE user_id = $1
  `, [gewinner.user_id]);

  await pool.query(`
    INSERT INTO nachrichten (von_id, an_id, betreff, text, datum)
    VALUES (0, $1, $2, $3, $4)
  `, [
    gewinner.user_id,
    "🎉 Level-Up!",
    `Du bist jetzt Level ${aktuellesLevel_G + 1}!\nDu erhältst 10 neue Skillpunkte.`,
    Math.floor(Date.now() / 1000)
  ]);
}

    // Verlierer
    await pool.query(`
      UPDATE spieler SET
      xp = xp + $1,
      kampfstaub = kampfstaub + $2,
      coins = coins + $3,
      leben = $4,
      niederlagen = niederlagen + 1,
      niederlagen_in_folge = niederlagen_in_folge + 1,
      siege_in_folge = 0,
      höchste_niederlagen_in_folge = GREATEST(höchste_niederlagen_in_folge, niederlagen_in_folge + 1),
      gesamt_schaden_ausgeteilt = gesamt_schaden_ausgeteilt + $5,
      gesamt_schaden_erhalten = gesamt_schaden_erhalten + $6,
      kritische_treffer = kritische_treffer + $7,
      kritische_treffer_erhalten = kritische_treffer_erhalten + $8,
      ausgewichen = ausgewichen + $9,
      angriffe_verfehlt = angriffe_verfehlt + $10,
      gesamt_kampfstaub_verdient = gesamt_kampfstaub_verdient + $11,
      gesamt_coins_verdient = gesamt_coins_verdient + $12,
      höchste_xp_in_einem_kampf = GREATEST(höchste_xp_in_einem_kampf, $13),
      höchster_gewinn_in_coins = GREATEST(höchster_gewinn_in_coins, $14),
      geblockter_schaden = geblockter_schaden + $15,
      höchste_kampfstaub_in_einem_kampf = GREATEST(höchste_kampfstaub_in_einem_kampf, $16),
      höchster_schaden_mit_einem_schlag = GREATEST(höchster_schaden_mit_einem_schlag, $17),
      kaempfe_insgesamt = kaempfe_insgesamt + 1
    WHERE user_id = $18


    `, [
      xpV, staubV, coinsV, lebenV,
      stats[verlierer.user_id].gesamt_schaden_ausgeteilt,
      stats[verlierer.user_id].gesamt_schaden_erhalten,
      stats[verlierer.user_id].kritische_treffer,
      stats[verlierer.user_id].kritische_treffer_erhalten,
      stats[verlierer.user_id].ausgewichen,
      stats[verlierer.user_id].angriffe_verfehlt,
      staubV,
      coinsV,
      xpV,
      coinsV,
      stats[verlierer.user_id].geblockter_schaden,
      staubV,
      stats[verlierer.user_id].höchster_schaden_mit_einem_schlag,
      verlierer.user_id
    ]);


    // Level-Up prüfen (Verlierer)
    const resV = await pool.query("SELECT xp, level FROM spieler WHERE user_id = $1", [verlierer.user_id]);
    const { xp: aktuellerXP_V, level: aktuellesLevel_V } = resV.rows[0];

    const nextLevelV = await pool.query("SELECT xp_benoetigt FROM levelstufen WHERE level = $1", [aktuellesLevel_V + 1]);
    const xpNaechstesLevelV = nextLevelV.rows[0]?.xp_benoetigt;

    if (xpNaechstesLevelV && aktuellerXP_V >= xpNaechstesLevelV) {
      await pool.query(`
        UPDATE spieler SET level = level + 1, skillpunkte = skillpunkte + 10 WHERE user_id = $1
      `, [verlierer.user_id]);

      await pool.query(`
        INSERT INTO nachrichten (von_id, an_id, betreff, text, datum)
        VALUES (0, $1, $2, $3, $4)
      `, [
        verlierer.user_id,
        "🎉 Level-Up!",
        `Du bist jetzt Level ${aktuellesLevel_V + 1}!\nDu erhältst 10 neue Skillpunkte.`,
        Math.floor(Date.now() / 1000)
      ]);
    }

    const aufruferId = spieler1.user_id;
    const empfaenger = s1.user_id === aufruferId ? s2 : s1;
    const empfaengerIstGewinner = empfaenger.user_id === gewinner.user_id;

    const betreff = empfaengerIstGewinner
      ? "🏆 Du hast einen Kampf gewonnen!"
      : "⚔️ Du wurdest angegriffen!";

    const text = empfaengerIstGewinner
      ? `Du hast den Kampf gegen ${aufruferId === s1.user_id ? s1.username : s2.username} gewonnen!\n\nBelohnung:\n- XP: ${xpG}\n- Kampfstaub: ${staubG}\n- Coins: ${coinsG}`
      : `Du hast den Kampf gegen ${aufruferId === s1.user_id ? s1.username : s2.username} verloren.\n\nTrostpreis:\n- XP: ${xpV}\n- Kampfstaub: ${staubV}\n- Coins: ${coinsV}`;

    await pool.query(`
      INSERT INTO nachrichten (von_id, an_id, betreff, text, datum)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      aufruferId,
      empfaenger.user_id,
      betreff,
      text,
      Math.floor(Date.now() / 1000)
    ]);

 
return {
  kampfId: kampfId,
  belohnungGewinner: {
    xp: xpG,
    staub: staubG,
    coins: coinsG
  },
  belohnungVerlierer: {
    xp: xpV,
    staub: staubV,
    coins: coinsV
  },
  gewinnerId: gewinner.user_id
};
}
