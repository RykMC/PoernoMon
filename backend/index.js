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

import { healPoernos } from "./src/utils/healingCron.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'supersecret';

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("PoernoMons API läuft"));

app.use('/api/auth', authRouter);

app.use('/api/poernomon', poernomonRoutes);

app.use('/api/design', designRouter);

app.use('/api/fight', fightRouter);

app.use('/api/nachrichten', nachrichtenRouter);

app.use('/api/statistik', statistikRouter);

app.use('/api/items', itemRouter);

app.use('/api/shop', shopRouter);



setInterval(() => {
  healPoernos();
  console.log("heilung startet...");
}, 60 * 1000); // jede Minute


app.listen(process.env.PORT || 5000, () => {
  console.log("Server läuft auf Port", process.env.PORT || 5000);
});
