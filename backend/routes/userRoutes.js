const express = require('express');
const userAuth = require('../middlewares/userAuth');
const { getUserData, getAllUsers } = require('../controllers/dataController');

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/all-users', userAuth, getAllUsers);

module.exports = userRouter;
// Compare this snippet from backend/controllers/userController.js: