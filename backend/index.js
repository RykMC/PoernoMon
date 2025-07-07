import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from './src/routes/authRouter.js';
import poernomonRoutes from './src/routes/poernomonsRouter.js'
import designRouter from './src/routes/designRouter.js';
import fightRouter from './src/routes/fightRouter.js';
import nachrichtenRouter from './src/routes/nachrichtenRouter.js';
import statistikRouter from './src/routes/statistikRouter.js';
import itemRouter from './src/routes/itemRouter.js';
import shopRouter from './src/routes/shopRouter.js';
import chatRouter from './src/routes/chatRouter.js';
import trainingsRouter from './src/routes/trainingsRouter.js';
import runBot from './src/utils/botEngine.js'


import { healPoernos, checkTrainings  } from "./src/utils/cron.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

const corsOptions = {
  origin: ["https://poernomon.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => res.send("PoernoMons API läuft"));

app.use('/auth', authRouter);

app.use('/poernomon', poernomonRoutes);

app.use('/design', designRouter);

app.use('/fight', fightRouter);

app.use('/nachrichten', nachrichtenRouter);

app.use('/statistik', statistikRouter);

app.use('/items', itemRouter);

app.use('/shop', shopRouter);

app.use('/chat', chatRouter);

app.use('/training', trainingsRouter);



setInterval(() => {
  console.log("heilung startet...");
  healPoernos();
  console.log("trainingchecks startet..."); 
  checkTrainings();
  

  // 1/10 Chance, also 10%
  if (Math.random() < 0.5) {
    console.log("🎲 Zufalls-Chance getroffen: Bot wird gestartet!");
    runBot();
  }

}, 60 * 1000);

// Testroute zum Prüfen
app.get("/api-pm/test", (req, res) => {
  res.json({ message: "CORS läuft!" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server läuft auf Port", process.env.PORT || 5000);
});
