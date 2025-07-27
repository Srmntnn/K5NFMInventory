const express = require('express');
const router = express.Router();

const {
    getItemsPerTimeRange,
    getUserStats,
    getTopBorrowers
} = require('../controllers/analyticsController');

// @route   GET /api/analytics/items?range=week|month|year
// @desc    Get number of items added over time
router.get('/items', getItemsPerTimeRange);

// @route   GET /api/analytics/user-stats
// @desc    Get total users and distinct borrowers
router.get('/user-stats', getUserStats);

// @route   GET /api/analytics/top-borrowers
// @desc    Get top 5 users who borrowed the most
router.get('/top-borrowers', getTopBorrowers);

module.exports = router;
