const dotenv = require('dotenv');

dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    redisUrl: process.env.REDIS_URL,
    postgresUrl: process.env.DATABASE_URL,
    gnewsApiKey: process.env.GNEWS_API_KEY,
    redditClientId: process.env.REDDIT_CLIENT_ID,
    redditClientSecret: process.env.REDDIT_CLIENT_SECRET,
    redditRefreshToken: process.env.REDDIT_REFRESH_TOKEN,
    redditUserAgent: process.env.REDDIT_USER_AGENT,
};

module.exports = config;