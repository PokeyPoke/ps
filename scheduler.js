import 'dotenv/config';
import axios from 'axios';
import { createClient } from 'redis';
import snoowrap from 'snoowrap';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const redisUrl = process.env.REDIS_TLS_URL || process.env.REDIS_URL;
const redis = createClient({
  url: redisUrl,
  socket: {
    tls: !!process.env.REDIS_TLS_URL,
    rejectUnauthorized: false
  }
});
await redis.connect();

const candidates = JSON.parse(fs.readFileSync(path.join('data','candidates.json')));

// Dummy metric fetchers (replace real APIs)
async function fetchTrends(name) { return Math.floor(Math.random()*100); }
async function fetchNews(name) { return Math.floor(Math.random()*50); }
async function fetchSocial(name) { return Math.floor(Math.random()*200); }

async function updateMetrics() {
  for (const c of candidates) {
    const [trends, news, social] = await Promise.all([
      fetchTrends(c.name), fetchNews(c.name), fetchSocial(c.name)
    ]);
    await redis.set(`candidate:${c.id}:trends`, trends);
    await redis.set(`candidate:${c.id}:news`, news);
    await redis.set(`candidate:${c.id}:social`, social);
  }
  console.log('Metrics updated @', new Date().toISOString());
}

// every 10 minutes
cron.schedule('*/10 * * * *', updateMetrics);
await updateMetrics();   // initial run
