const mongoose = require("mongoose");

const VisaSchema = new mongoose.Schema({
    // Personal Information
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    
    // Destination Information
    destination: {
        type: String,
        required: true
    },
    otherCountries: {
        type: String,
        trim: true,
        default: ""
    },
    
    // Travel History
    hasTraveledAbroad: {
        type: Boolean,
        default: false
    },
    visitedCountries: {
        type: String,
        trim: true,
        default: ""
    },
    
    // Application Status
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'needs_info'],
        default: 'pending'
    },
    
    // Admin Notes
    adminNotes: {
        type: String,
        trim: true,
        default: ""
    },
    
    // Documents (file paths)
    documents: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // User Reference (if system has user accounts)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    
    // Timestamps
    submittedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
});

// Index for faster queries
VisaSchema.index({ email: 1 });
VisaSchema.index({ status: 1 });
VisaSchema.index({ submittedAt: -1 });

module.exports = mongoose.models.Visa || mongoose.model("Visa", VisaSchema);

