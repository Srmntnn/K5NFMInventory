const Item = require('../models/itemModel');
const User = require('../models/userModel');
const BorrowRequest = require('../models/borrowRequestModel');
const dayjs = require('dayjs'); // For CommonJS

// Utility to get date range
const getDateRange = (range) => {
    const now = new Date();
    let startDate;

    switch (range) {
        case 'week':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // show last 7 days including today
            break;
        case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        case 'month':
        default:
            startDate = new Date(now.setDate(now.getDate() - 29)); // last 30 days
            break;
    }

    return { startDate, endDate: new Date() };
};

const getItemsPerTimeRange = async (req, res) => {
    try {
        const { range = 'month' } = req.query;
        const { startDate, endDate } = getDateRange(range);

        let groupStage;
        let buildEmptyBuckets;

        if (range === 'week' || range === 'month') {
            groupStage = {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            };

            buildEmptyBuckets = () => {
                const days = range === 'week' ? 7 : 30;
                const buckets = [];
                for (let i = days - 1; i >= 0; i--) {
                    const label = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
                    buckets.push({ label, count: 0 });
                }
                return buckets;
            };
        } else if (range === 'year') {
            groupStage = {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            };

            buildEmptyBuckets = () => {
                const buckets = [];
                for (let i = 11; i >= 0; i--) {
                    const date = dayjs().subtract(i, 'month');
                    const label = `${date.format('MMM')} ${date.format('YYYY')}`;
                    buckets.push({ label, count: 0 });
                }
                return buckets;
            };
        }

        const rawData = await Item.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $group: groupStage }
        ]);

        const buckets = buildEmptyBuckets();

        if (range === 'year') {
            rawData.forEach((entry) => {
                const label = `${dayjs().month(entry._id.month - 1).format('MMM')} ${entry._id.year}`;
                const bucket = buckets.find((b) => b.label === label);
                if (bucket) bucket.count = entry.count;
            });
        } else {
            rawData.forEach((entry) => {
                const bucket = buckets.find((b) => b.label === entry._id);
                if (bucket) bucket.count = entry.count;
            });
        }

        res.json(buckets);
    } catch (err) {
        console.error('Error fetching item analytics:', err);
        res.status(500).json({ message: 'Error getting item data', error: err.message });
    }
};

const getUserStats = async (req, res) => {
    try {
        // Aggregate users per day
        const userStatsByDate = await User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    userCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Aggregate borrowers per day (count unique requestedBy per day)
        const borrowStats = await BorrowRequest.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    borrowersSet: { $addToSet: "$requestedBy" }
                }
            },
            {
                $project: {
                    date: "$_id",
                    borrowerCount: { $size: "$borrowersSet" }
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Total users count (all time)
        const totalUsers = await User.countDocuments();

        res.json({
            totalUsers,
            userStats: userStatsByDate.map(item => ({
                date: item._id,
                count: item.userCount
            })),
            borrowStats: borrowStats.map(item => ({
                date: item.date,
                count: item.borrowerCount
            })),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error getting user stats", error: err.message });
    }
};


const getTopBorrowers = async (req, res) => {
    try {
        const result = await BorrowRequest.aggregate([
            {
                $addFields: {
                    month: { $dateToString: { format: "%B", date: "$createdAt" } }
                }
            },
            {
                $group: {
                    _id: { requestedBy: "$requestedBy", month: "$month" },
                    borrowCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.requestedBy",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    name: "$user.name",
                    email: "$user.email",
                    month: "$_id.month",
                    borrowCount: 1,
                    _id: 0
                }
            },
            {
                $sort: { borrowCount: -1 }
            },
            {
                $limit: 5
            }
        ]);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error getting top borrowers', error: err.message });
    }
};


module.exports = {
    getItemsPerTimeRange,
    getUserStats,
    getTopBorrowers
};
