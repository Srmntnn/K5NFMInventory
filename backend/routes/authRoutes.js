const express = require('express');
const { signup, login, logout, sendVerifyOTP, verifyEmail, isAuthenticated, sendRestPasswordOTP, resetPassword, resendOtp, verifyOtp } = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-otp', userAuth, sendVerifyOTP);
router.post('/verify-account', userAuth, verifyEmail);
router.post('/is-auth', userAuth, isAuthenticated);
router.post('/send-reset-otp', sendRestPasswordOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', userAuth, resendOtp)
router.post('/verify-otp', verifyOtp);


module.exports = router;

