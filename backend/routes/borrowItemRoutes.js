const express = require('express');
const { createBorrowItemRequest, returnBorrowedItem, approveOrRejectRequest, requestReturnItem, getAvailableItems, getUserBorrowRequests, cancelBorrowRequest, getAllRequests, rejectReturnRequest } = require('../controllers/borrowRequestController');
const userAuth = require('../middlewares/userAuth');

const borrowRoutes = express.Router();

borrowRoutes.post('/borrow-item', userAuth, createBorrowItemRequest);
borrowRoutes.patch('/return-item/:id', userAuth, returnBorrowedItem);
borrowRoutes.patch('/request/:id/action', userAuth, approveOrRejectRequest);
borrowRoutes.patch('/request-return/:id', userAuth, requestReturnItem);
borrowRoutes.get('/available-items', getAvailableItems)
borrowRoutes.get('/my-requests', userAuth, getUserBorrowRequests);
borrowRoutes.delete("/cancel/:id", userAuth, cancelBorrowRequest);
borrowRoutes.get('/request/all', userAuth, getAllRequests);
borrowRoutes.patch('/return-item/:id/reject', userAuth, rejectReturnRequest);

module.exports = borrowRoutes;
