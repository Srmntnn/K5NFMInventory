const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new mongoose.Schema({
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
      },
    status: [
        {
            name: {
                type: String,
                required: true,
                enum: ["repair", "in use", "not in use"],
            },
            date: {
                type: Date,
                default: Date.now(),
            },
        },
    ],
}, { timestamps: true });

const History = mongoose.model('history', historySchema);
module.exports = History;