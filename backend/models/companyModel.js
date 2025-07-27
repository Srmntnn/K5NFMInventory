// models/Company.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompanySchema = new mongoose.Schema({
    companyName: { required: true, type: String },
    description: { type: String, required: true },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, { timestamps: true });

const Company = mongoose.model('Company', CompanySchema);
module.exports = Company;
