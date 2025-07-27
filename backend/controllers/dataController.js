const User = require('../models/userModel');

const getUserData = async (req, res) => {
    try {
        const userId = req.userId; // ✅ Not from req.body

        const user = await User.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role,
            },
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // ← remove the field projection

        return res.json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    getUserData,
    getAllUsers
}