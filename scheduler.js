import 'dotenv/config';
import axios from 'axios';
import cron from 'node-cron';
import { createClient } from 'redis';
import pkg from 'google-trends-api';
const googleTrends = pkg;
import Snoowrap from 'snoowrap';
import fs from 'fs';
import path from 'path';

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

const candidates = JSON.parse(
  fs.readFileSync(path.join('data', 'candidates.json'))
);

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

async function updateTrends(c) {
  try {
    const res = await googleTrends.interestOverTime({
      keyword: c.name,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24)
    });
    const { default: data } = JSON.parse(res);
    const latest = data.timelineData.pop().value[0];
    await redis.set(`candidate:${c.id}:trends`, latest);
  } catch (e) {
    console.error('trends', c.name, e.message);
  }
}

async function updateNews(c) {
  try {
    const url = \`https://gnews.io/api/v4/search?q=\${encodeURIComponent(c.name)}&lang=en&token=\${process.env.GNEWS_API_KEY}&max=10\`;
    const { data } = await axios.get(url);
    const count = data.totalArticles ?? data.total ?? 0;
    await redis.set(`candidate:${c.id}:news`, count);
  } catch (e) {
    console.error('news', c.name, e.message);
  }
}

async function updateSocial(c) {
  try {
    const posts = await reddit.search({
      query: c.name,
      sort: 'new',
      time: 'day',
      limit: 100
    });
    await redis.set(`candidate:${c.id}:social`, posts.length);
  } catch (e) {
    console.error('reddit', c.name, e.message);
  }
}

async function refreshAll() {
  await Promise.all(
    candidates.flatMap((c) => [updateTrends(c), updateNews(c), updateSocial(c)])
  );
  console.log('metrics updated', new Date().toISOString());
}

refreshAll();
cron.schedule('*/10 * * * *', refreshAll);
