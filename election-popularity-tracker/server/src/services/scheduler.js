const cron = require('node-cron');
const { fetchExternalData } = require('../utils/externalDataFetcher');
const redisClient = require('./redisClient');

const scheduleDataFetch = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const data = await fetchExternalData();
            // Assuming data is an object with candidate IDs as keys
            for (const candidateId in data) {
                await redisClient.set(`candidate:${candidateId}:trends`, data[candidateId].trends);
                await redisClient.set(`candidate:${candidateId}:news`, data[candidateId].news);
                await redisClient.set(`candidate:${candidateId}:social`, data[candidateId].social);
            }
            console.log('External data fetched and updated in Redis');
        } catch (error) {
            console.error('Error fetching external data:', error);
        }
    });
};

module.exports = {
    scheduleDataFetch,
};