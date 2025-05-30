const Vote = require('../services/db'); // Import the database service for vote operations
const redisClient = require('../services/redisClient'); // Import the Redis client for caching
const logger = require('../utils/logger'); // Import the logging utility

// Function to handle vote submission
exports.submitVote = async (req, res) => {
    const { candidateId, userId } = req.body;

    try {
        // Check rate limiting in Redis
        const voteKey = `vote:${userId}:${candidateId}`;
        const voteCount = await redisClient.get(voteKey);

        if (voteCount) {
            return res.status(429).json({ message: 'You can only vote once every 24 hours.' });
        }

        // Submit the vote to the database
        await Vote.incrementVote(candidateId);

        // Cache the vote in Redis with a 24-hour expiration
        await redisClient.setex(voteKey, 86400, 1);

        // Log the successful vote
        logger.info(`User ${userId} voted for candidate ${candidateId}`);
        return res.status(200).json({ message: 'Vote submitted successfully.' });
    } catch (error) {
        logger.error(`Error submitting vote: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// Function to retrieve vote counts for a candidate
exports.getVoteCounts = async (req, res) => {
    const { candidateId } = req.params;

    try {
        const voteCount = await Vote.getVoteCount(candidateId);
        return res.status(200).json({ candidateId, voteCount });
    } catch (error) {
        logger.error(`Error retrieving vote counts: ${error.message}`);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};