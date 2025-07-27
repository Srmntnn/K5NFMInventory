// controllers/borrowRequestController.js
const mongoose = require('mongoose');
const BorrowRequest = require('../models/borrowRequestModel');
const Item = require('../models/itemModel');

const createBorrowItemRequest = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { itemId, reason } = req.body;

        // Validate input
        if (!itemId || !reason || reason.trim() === '') {
            return res.status(400).json({ success: false, message: 'Item ID and reason are required.' });
        }

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ success: false, message: 'Invalid item ID.' });
        }

        // Fetch item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.status === 'borrowed') {
            return res.status(400).json({ success: false, message: 'Item is currently borrowed' });
        }

        // Check if request already exists
        const existingRequest = await BorrowRequest.findOne({
            requestedBy: req.user._id,
            item: itemId,
            status: { $in: ['pending', 'approved'] },
            returnApproved: { $ne: true },
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active borrow request for this item.',
            });
        }

        // Prepare borrow request data
        const borrowRequestData = {
            item: item._id,
            requestedBy: req.user._id,
            reason: reason.trim(),
        };

        // Auto-approve if admin
        if (req.user.role === 'admin') {
            borrowRequestData.status = 'approved';
            borrowRequestData.approvedBy = req.user._id;
            borrowRequestData.borrowDate = new Date();

            item.status = 'borrowed';
            await item.save();
        } else if (req.user.role === 'department') {
            borrowRequestData.status = 'pending';
        } else {
            return res.status(403).json({ success: false, message: 'Unauthorized user role' });
        }

        // Log for debugging
        console.log("Creating borrow request:", borrowRequestData);

        const borrowRequest = await BorrowRequest.create(borrowRequestData);

        return res.status(201).json({
            success: true,
            message:
                borrowRequestData.status === 'approved'
                    ? 'Item borrowed successfully (auto-approved)'
                    : 'Borrow request submitted for approval.',
            borrowRequest,
        });
    } catch (error) {
        console.error("❌ Borrow request error:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });

        return res.status(500).json({
            success: false,
            message: 'Error processing request',
            error: error.message,
        });
    }
};

const approveOrRejectRequest = async (req, res) => {
    try {
        const request = await BorrowRequest.findById(req.params.id).populate('requestedBy item');
        if (!request) return res.status(404).json({ success: false, message: 'Borrow request not found' });

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can approve/reject requests' });
        }

        const { action, adminRemarks } = req.body;

        if (action === 'approve') {
            if (request.status === 'approved') {
                return res.status(400).json({ success: false, message: 'Request already approved' });
            }

            const item = await Item.findById(request.item._id);
            if (item.status === 'borrowed') {
                return res.status(400).json({ success: false, message: 'Item already borrowed' });
            }

            request.status = 'approved';
            request.approvedBy = req.user._id;
            request.borrowDate = new Date();
            item.status = 'borrowed';

            await Promise.all([request.save(), item.save()]);
        } else if (action === 'reject') {
            request.status = 'rejected';
            request.adminRemarks = adminRemarks || '';
            await request.save();
        } else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use "approve" or "reject".' });
        }

        res.status(200).json({
            success: true,
            message: `Request ${action}ed successfully.`,
            borrower: {
                name: request.requestedBy.name,
                email: request.requestedBy.email,
            },
            item: request.item.itemName,
            status: request.status,
            remarks: request.adminRemarks || null,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating request', error: error.message });
    }
};

const requestReturnItem = async (req, res) => {
    try {
        const request = await BorrowRequest.findById(req.params.id).populate('item');

        if (!request || request.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Invalid or unapproved borrow request' });
        }

        // Check if the user is authorized (either the borrower or admin)
        const isAdmin = req.user.role === 'admin';
        const isBorrower = request.requestedBy.toString() === req.user._id.toString();

        if (!isAdmin && !isBorrower) {
            return res.status(403).json({ success: false, message: 'Not authorized to request return for this item' });
        }

        if (request.returnRequested || request.returnApproved) {
            return res.status(400).json({ success: false, message: 'Return already requested or approved' });
        }

        if (isAdmin) {
            // Admin is returning — auto approve
            request.returnRequested = true;
            request.returnApproved = true;
            request.returnedDate = new Date();

            const item = await Item.findById(request.item._id);
            item.status = 'available';
            await item.save();

            await request.save();

            return res.status(200).json({
                success: true,
                message: 'Return automatically approved and item marked as available',
                item: item.itemName,
            });
        } else {
            // Normal borrower: just request return
            request.returnRequested = true;
            await request.save();

            return res.status(200).json({
                success: true,
                message: 'Return request submitted, awaiting admin approval',
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error requesting return', error: error.message });
    }
};


const returnBorrowedItem = async (req, res) => {
    try {
        const request = await BorrowRequest.findById(req.params.id).populate('item');

        if (!request || request.status !== 'approved' || !request.returnRequested) {
            return res.status(400).json({ success: false, message: 'No return requested or invalid request' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can confirm item returns' });
        }

        request.returnApproved = true;
        request.returnedDate = new Date();
        await request.save();

        const item = await Item.findById(request.item._id);
        item.status = 'available'; // Mark item as returned
        await item.save();

        res.status(200).json({
            success: true,
            message: 'Return approved and item marked as available',
            item: item.itemName,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error processing return', error: error.message });
    }
};

const rejectReturnRequest = async (req, res) => {
    try {
        const request = await BorrowRequest.findById(req.params.id);

        if (!request || request.status !== 'approved' || !request.returnRequested) {
            return res.status(400).json({ success: false, message: 'Invalid or missing return request.' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Only admins can reject return requests.' });
        }

        request.returnStatus = 'rejected';
        request.returnRemarks = req.body.returnRemarks || 'Return rejected.';
        await request.save();

        res.status(200).json({
            success: true,
            message: 'Return request rejected.',
            requestId: request._id,
            returnRemarks: request.returnRemarks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rejecting return request.', error: error.message });
    }
};

const getAvailableItems = async (req, res) => {
    try {
        // Fetch all items with necessary populations
        const items = await Item.find()
            .populate("manufacturer")
            .populate("location")
            .lean(); // Use .lean() so we can add custom fields to the returned objects

        // For each item, check if it's borrowed and attach borrower info
        const itemsWithBorrowers = await Promise.all(
            items.map(async (item) => {
                if (item.status === "borrowed") {
                    const activeBorrow = await BorrowRequest.findOne({
                        item: item._id,
                        status: "approved",
                        returnApproved: false,
                    })
                        .populate("requestedBy", "name email") // populate only name and email
                        .lean();

                    if (activeBorrow?.requestedBy) {
                        item.borrowedBy = activeBorrow.requestedBy;
                    }
                }
                return item;
            })
        );

        res.status(200).json({ success: true, items: itemsWithBorrowers });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getUserBorrowRequests = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const requests = await BorrowRequest.find({ requestedBy: req.user._id })
            .populate('item') // Optional: populate item details
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error("Error fetching user requests:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const cancelBorrowRequest = async (req, res) => {
    try {
        const request = await BorrowRequest.findById(req.params.id);

        if (!request || request.status !== "pending") {
            return res.status(400).json({ success: false, message: "Only pending requests can be cancelled." });
        }

        // Only borrower or admin can cancel
        const isAdmin = req.user.role === "admin";
        const isOwner = request.requestedBy.toString() === req.user._id.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this request." });
        }

        await BorrowRequest.findByIdAndDelete(req.params.id);

        return res.status(200).json({ success: true, message: "Borrow request cancelled successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error cancelling request", error: error.message });
    }
};

// GET /api/request/all
const getAllRequests = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const requests = await BorrowRequest.find()
            .populate('item requestedBy')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching requests' });
    }
};


module.exports = {
    createBorrowItemRequest,
    approveOrRejectRequest,
    returnBorrowedItem,
    requestReturnItem,
    getAvailableItems,
    getUserBorrowRequests,
    cancelBorrowRequest,
    getAllRequests,
    rejectReturnRequest
};
