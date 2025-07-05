import fs from 'fs';
import path from 'path';
import pool from './src/db/db.js'; 

const creaturesFolder = path.resolve('public/images/rein');

const seedCreatures = async () => {
  try {
    const files = fs.readdirSync(creaturesFolder);

    for (const file of files) {
      // Nur Bilddateien verarbeiten
      if (!file.match(/\.(png|jpg|jpeg|webp|gif)$/i)) continue;

      const imagePath = `images/creatures/${file}`;

      await pool.query(
        "INSERT INTO kreaturen (userid, bild ) VALUES (0, $1)",
        [imagePath]
      );

      console.log(`✔ Eingefügt: ${file}`);
    }

    console.log('✅ Fertig mit Einfügen.');
    process.exit();
  } catch (err) {
    console.error('❌ Fehler beim Einfügen:', err);
    process.exit(1);
  }
};

seedCreatures();
