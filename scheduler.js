import 'dotenv/config';
import axios from 'axios';
import cron from 'node-cron';
import { createClient } from 'redis';
import googleTrends from 'google-trends-api';
import Snoowrap from 'snoowrap';
import fs from 'fs';
import path from 'path';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const candidates = JSON.parse(
  fs.readFileSync(path.join('data', 'candidates.json'))
);

// Reddit client
const r = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

async function updateGoogleTrends(candidate) {
  try {
    const result = await googleTrends.interestOverTime({
      keyword: candidate.name,
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24) // last 24h
    });
    const json = JSON.parse(result);
    const points = json.default.timelineData;
    const latest = points[points.length - 1].value[0]; // 0-100
    await redis.set(`candidate:${candidate.id}:trends`, latest);
  } catch (e) {
    console.error('GT error', e);
  }
}

async function updateNewsCount(candidate) {
  try {
    const url = \`https://gnews.io/api/v4/search?q=\${encodeURIComponent(candidate.name)}&lang=en&token=\${process.env.GNEWS_API_KEY}&max=10\`;
    const res = await axios.get(url);
    const count = res.data.totalArticles || res.data.total || 0;
    await redis.set(\`candidate:\${candidate.id}:news\`, count);
  } catch (e) {
    console.error('News error', e);
  }
}

async function updateRedditMentions(candidate) {
  try {
    const posts = await r.search({
      query: candidate.name,
      sort: 'new',
      time: 'day',
      limit: 100
    });
    await redis.set(\`candidate:\${candidate.id}:social\`, posts.length);
  } catch (e) {
    console.error('Reddit error', e);
  }
}

async function updateAll() {
  for (const c of candidates) {
    await Promise.all([
      updateGoogleTrends(c),
      updateNewsCount(c),
      updateRedditMentions(c)
    ]);
  }
  console.log('External metrics refreshed', new Date().toISOString());
}

// every 10 minutes
cron.schedule('*/10 * * * *', updateAll);

// run once at start
updateAll();
