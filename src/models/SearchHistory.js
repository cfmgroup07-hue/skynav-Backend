import mongoose from 'mongoose';

/**
 * SearchHistory Schema
 * Tracks user flight searches for analytics and quick re-search
 */
const searchHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        from: {
            type: String,
            required: [true, 'Departure location is required'],
            trim: true,
        },
        to: {
            type: String,
            required: [true, 'Destination location is required'],
            trim: true,
        },
        departureDate: {
            type: Date,
            required: [true, 'Departure date is required'],
        },
        returnDate: {
            type: Date,
            default: null,
        },
        passengers: {
            type: Number,
            default: 1,
            min: [1, 'At least 1 passenger required'],
            max: [9, 'Maximum 9 passengers allowed'],
        },
        searchedAt: {
            type: Date,
            default: Date.now,
            index: -1, // Index in descending order for recent searches
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient queries
searchHistorySchema.index({ userId: 1, searchedAt: -1 });

// Auto-delete searches older than 90 days
searchHistorySchema.index(
    { searchedAt: 1 },
    { expireAfterSeconds: 90 * 24 * 60 * 60 } // 90 days
);

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
