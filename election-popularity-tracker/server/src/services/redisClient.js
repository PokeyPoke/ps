const redis = require('redis');
const { promisify } = require('util');
const config = require('../config');

const redisClient = redis.createClient({
    url: config.REDIS_URL,
    tls: {
        rejectUnauthorized: false
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const incrAsync = promisify(redisClient.incr).bind(redisClient);
const expireAsync = promisify(redisClient.expire).bind(redisClient);

redisClient.connect();

module.exports = {
    redisClient,
    getAsync,
    setAsync,
    incrAsync,
    expireAsync
};