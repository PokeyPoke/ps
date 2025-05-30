const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const getVotes = async (candidateId) => {
    const res = await pool.query('SELECT votes, clicks FROM votes WHERE candidate_id = $1', [candidateId]);
    return res.rows[0];
};

const updateVotes = async (candidateId, votes, clicks) => {
    await pool.query('INSERT INTO votes (candidate_id, votes, clicks) VALUES ($1, $2, $3) ON CONFLICT (candidate_id) DO UPDATE SET votes = $2, clicks = $3', [candidateId, votes, clicks]);
};

const getAllVotes = async () => {
    const res = await pool.query('SELECT * FROM votes');
    return res.rows;
};

module.exports = {
    getVotes,
    updateVotes,
    getAllVotes
};