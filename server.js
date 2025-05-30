import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import compression from 'compression';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(compression());              // gzip static assets
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Redis connection (TLS in prod)
const redisUrl = process.env.REDIS_TLS_URL || process.env.REDIS_URL;
const redis = createClient({
  url: redisUrl,
  socket: {
    tls: !!process.env.REDIS_TLS_URL,
    rejectUnauthorized: false
  }
});
await redis.connect();

// Postgres pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// DB table bootstrap
await pool.query(`
  CREATE TABLE IF NOT EXISTS votes (
    candidate_id TEXT PRIMARY KEY,
    total_votes  BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0
  );`);

// Load candidates list
const candidates = JSON.parse(fs.readFileSync(path.join('data','candidates.json')));

// Ensure rows exist & load persisted counts
for (const {id} of candidates) {
  await pool.query('INSERT INTO votes (candidate_id) VALUES ($1) ON CONFLICT DO NOTHING', [id]);
}
const { rows } = await pool.query('SELECT * FROM votes');
for (const row of rows) {
  await redis.set(`candidate:${row.candidate_id}:votes`, row.total_votes);
  await redis.set(`candidate:${row.candidate_id}:clicks`, row.total_clicks);
}

// Serve React static build
const distPath = path.resolve('dist');
app.use(express.static(distPath));
app.get('*', (_, res) => res.sendFile(path.join(distPath,'index.html')));

// Helper to build snapshot
const buildSnapshot = async () => {
  const snapshot = [];
  for (const c of candidates) {
    const [votes, clicks, trends, news, social] = await Promise.all([
      redis.get(`candidate:${c.id}:votes`),
      redis.get(`candidate:${c.id}:clicks`),
      redis.get(`candidate:${c.id}:trends`),
      redis.get(`candidate:${c.id}:news`),
      redis.get(`candidate:${c.id}:social`)
    ]);
    snapshot.push({ ...c,
      votes: Number(votes)||0,
      clicks: Number(clicks)||0,
      trends: Number(trends)||0,
      news: Number(news)||0,
      social: Number(social)||0
    });
  }
  return snapshot;
};

// Socket.io
io.on('connection', async (socket) => {
  socket.emit('snapshot', await buildSnapshot());

  socket.on('vote', async ({ candidateId }) => {
    await redis.incr(`candidate:${candidateId}:votes`);
    io.emit('update', { candidateId, field: 'votes' });
  });

  socket.on('click', async ({ candidateId }) => {
    await redis.incr(`candidate:${candidateId}:clicks`);
    io.emit('update', { candidateId, field: 'clicks' });
  });
});

// Persist Redis counters to Postgres every minute
setInterval(async () => {
  for (const {id} of candidates) {
    const [votes, clicks] = await Promise.all([
      redis.get(`candidate:${id}:votes`),
      redis.get(`candidate:${id}:clicks`)
    ]);
    await pool.query(
      'UPDATE votes SET total_votes=$2, total_clicks=$3 WHERE candidate_id=$1',
      [id, Number(votes)||0, Number(clicks)||0]
    );
  }
}, 60*1000);

httpServer.listen(PORT, () => console.log('Server on', PORT));
