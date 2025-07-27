const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminRemarks: String,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    borrowDate: Date,
    returnedDate: Date,
    returnRequested: { type: Boolean, default: false },
    returnApproved: { type: Boolean, default: false },
    returnStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected'],
        default: 'none',
    },
    returnRemarks: String,

}, { timestamps: true });

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema);
module.exports = BorrowRequest;
