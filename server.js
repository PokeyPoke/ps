import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer);

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// ensure votes table exists
await pool.query(`CREATE TABLE IF NOT EXISTS votes (
  candidate_id TEXT PRIMARY KEY,
  total_votes BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0
)`);

const candidates = JSON.parse(
  fs.readFileSync(path.join('data', 'candidates.json'))
);

// init counts in Redis & DB if missing
for (const c of candidates) {
  const exists = await redis.exists(`candidate:${c.id}:votes`);
  if (!exists) {
    await redis.set(`candidate:${c.id}:votes`, 0);
    await redis.set(`candidate:${c.id}:clicks`, 0);
  }
  await pool.query(
    'INSERT INTO votes (candidate_id) VALUES ($1) ON CONFLICT DO NOTHING',
    [c.id]
  );
}

app.use(express.static('public'));

io.on('connection', (socket) => {
  // send initial counts
  const sendSnapshot = async () => {
    let snapshot = [];
    for (const c of candidates) {
      const votes = parseInt(await redis.get(`candidate:${c.id}:votes`)) || 0;
      const clicks = parseInt(await redis.get(`candidate:${c.id}:clicks`)) || 0;
      const trends = await redis.get(`candidate:${c.id}:trends`) || 0;
      const news = await redis.get(`candidate:${c.id}:news`) || 0;
      const social = await redis.get(`candidate:${c.id}:social`) || 0;
      snapshot.push({ ...c, votes, clicks, trends, news, social });
    }
    socket.emit('snapshot', snapshot);
  };

  sendSnapshot();

  socket.on('vote', async ({ candidateId }) => {
    // no strict per-day enforcement here; front-end handles basic
    await redis.incr(`candidate:${candidateId}:votes`);
    io.emit('update', { candidateId, field: 'votes' });
  });

  socket.on('click', async ({ candidateId }) => {
    await redis.incr(`candidate:${candidateId}:clicks`);
    io.emit('update', { candidateId, field: 'clicks' });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// flush redis counts to DB every minute
setInterval(async () => {
  for (const c of candidates) {
    const votes = parseInt(await redis.get(`candidate:${c.id}:votes`)) || 0;
    const clicks = parseInt(await redis.get(`candidate:${c.id}:clicks`)) || 0;
    await pool.query(
      'UPDATE votes SET total_votes=$1, total_clicks=$2 WHERE candidate_id=$3',
      [votes, clicks, c.id]
    );
  }
}, 60000);
