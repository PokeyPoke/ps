import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// pick the TLS URL if Heroku gives us one, otherwise fall back to REDIS_URL
const redisUrl = process.env.REDIS_TLS_URL || process.env.REDIS_URL;

const redis = createClient({
  url: redisUrl,
  socket: {
    tls: true,               // tell node‑redis we’re using TLS
    rejectUnauthorized: false // accept Heroku’s self‑signed cert
  }
});

await redis.connect();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


// ---- DB table bootstrap --------------------------------
const createVotesTableSQL = `
CREATE TABLE IF NOT EXISTS votes (
  candidate_id  TEXT   PRIMARY KEY,
  total_votes   BIGINT DEFAULT 0,
  total_clicks  BIGINT DEFAULT 0
);`;

await pool.query(createVotesTableSQL);
// --------------------------------------------------------


const candidates = JSON.parse(
  fs.readFileSync(path.join('data', 'candidates.json'))
);

for (const c of candidates) {
  await pool.query(
    'INSERT INTO votes (candidate_id) VALUES ($1) ON CONFLICT DO NOTHING',
    [c.id]
  );
  const vKey = `candidate:${c.id}:votes`;
  const cKey = `candidate:${c.id}:clicks`;
  if (!(await redis.exists(vKey))) await redis.set(vKey, 0);
  if (!(await redis.exists(cKey))) await redis.set(cKey, 0);
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  (async () => {
    let snapshot = [];
    for (const c of candidates) {
      const votes = Number(await redis.get(`candidate:${c.id}:votes`)) || 0;
      const clicks = Number(await redis.get(`candidate:${c.id}:clicks`)) || 0;
      const trends = Number(await redis.get(`candidate:${c.id}:trends`)) || 0;
      const news = Number(await redis.get(`candidate:${c.id}:news`)) || 0;
      const social = Number(await redis.get(`candidate:${c.id}:social`)) || 0;
      snapshot.push({ ...c, votes, clicks, trends, news, social });
    }
    socket.emit('snapshot', snapshot);
  })();

  socket.on('vote', async ({ candidateId }) => {
    await redis.incr(`candidate:${candidateId}:votes`);
    io.emit('update', { candidateId, field: 'votes' });
  });

  socket.on('click', async ({ candidateId }) => {
    await redis.incr(`candidate:${candidateId}:clicks`);
    io.emit('update', { candidateId, field: 'clicks' });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server on ${PORT}`));

// Durability flush every minute
setInterval(async () => {
  for (const c of candidates) {
    const votes = Number(await redis.get(`candidate:${c.id}:votes`)) || 0;
    const clicks = Number(await redis.get(`candidate:${c.id}:clicks`)) || 0;
    await pool.query(
      'UPDATE votes SET total_votes=$1, total_clicks=$2 WHERE candidate_id=$3',
      [votes, clicks, c.id]
    );
  }
}, 60000);
