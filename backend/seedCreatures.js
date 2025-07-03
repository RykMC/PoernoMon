import fs from 'fs';
import path from 'path';
import pool from './src/db/db.js'; 

const creaturesFolder = path.resolve('public/images/rein2');

const seedCreatures = async () => {
  try {
    const files = fs.readdirSync(creaturesFolder);

    for (const file of files) {
      // Nur Bilddateien verarbeiten
      if (!file.match(/\.(png|jpg|jpeg|webp|gif)$/i)) continue;

      const imagePath = `images/frames/${file}`;

      await pool.query(
        "INSERT INTO designs (bild, name, typ ) VALUES ($1, $2, 'frame')",
        [imagePath, file]
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
