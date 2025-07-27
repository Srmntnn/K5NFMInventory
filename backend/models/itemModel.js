const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    description: String,
    serialNo: { type: String, required: true },
    manufacturer: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    model: { type: String, required: true },
    dateOfPurchase: Date,
    user: {
        type: String,
        required: true,
        enum: ["normal user", "department", "admin"],
        default: "normal user"
    },
    quantity: Number,
    condition: {
        type: String,
        enum: ['good', 'damaged', 'needs repair'],
        default: 'good'
    },
    status: {
        type: String,
        enum: ['available', 'borrowed'],
        default: 'available'
    },
    location: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location"
        }
    ],
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

/**
 * SAFEGUARD: Ensure `createdAt` is set correctly, even if omitted.
 * This handles edge cases during manual or legacy inserts.
 */
itemSchema.pre('save', function (next) {
    if (!this.createdAt) {
        this.createdAt = this._id.getTimestamp();
    }
    next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
