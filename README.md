### 2028 Election Popularity Tracker – Free‑tier Edition

* Node 20, ESM (`type: module`)
* Express + Socket.io
* Redis & Postgres (Heroku hobby‑dev free)
* External data (free):
  * **google-trends-api 4.9.2** (no key)
  * **GNews** – 100 req/day
  * **Reddit** official API

Follow the same deploy steps in previous README. This version pins a valid
`google-trends-api` and specifies Node 20, so the Heroku build will succeed.
