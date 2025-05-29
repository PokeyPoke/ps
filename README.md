# 2028 Election Popularity Tracker (ps)

Light‑weight, real‑time popularity game for the 2028 U.S. presidential race.  
**Tech stack (all free tiers):**

* Node.js + Express + Socket.io – real‑time web server  
* Heroku Eco dyno (first month \$5) or hobby (no longer free), Heroku‑Redis hobby‑dev (free)  
* Postgres hobby‑dev (free) – persistent tallies  
* Google Trends (via `google-trends-api`), GNews free tier (100 req/day), Reddit API (free)  

## Local run

```bash
git clone <your‑fork>
cd ps
cp .env.example .env   # fill keys
npm install
npm run worker &       # scheduler
npm start
```

Visit http://localhost:3000.

## Deploy to Heroku

```bash
heroku create ps-2028-pop
heroku addons:create heroku-redis:hobby-dev
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set $(cat .env | xargs)
git push heroku main
heroku scale worker=1
```

Adjust add‑on tiers as traffic grows.

## Free‑resource notes

* **Google Trends** scraping is free; no key needed.  
* **GNews** free plan gives 100 calls/day – enough if we poll once per 10 min x 3 candidates = 432/day → use smaller interval (e.g. hourly) or rotate keywords.  
* **Reddit** API is free; register an app to get client id/secret.  
* If you exceed quotas, simply slow the cron interval in `scheduler.js`.

---
