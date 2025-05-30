const express = require('express');
const voteController = require('../controllers/voteController');

const router = express.Router();

// Route to submit a vote
router.post('/vote', voteController.submitVote);

// Route to get current vote counts
router.get('/votes', voteController.getVoteCounts);

// Additional routes can be added here

module.exports = router;