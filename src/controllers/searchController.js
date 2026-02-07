import SearchHistory from '../models/SearchHistory.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Save a flight search
 * @route   POST /api/search/save
 * @access  Private
 */
const saveSearch = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
        }

        const { from, to, departureDate, returnDate, passengers } = req.body;

        // Create search history entry
        const search = await SearchHistory.create({
            userId: req.user._id,
            from,
            to,
            departureDate,
            returnDate: returnDate || null,
            passengers: passengers || 1,
        });

        res.status(201).json({
            success: true,
            message: 'Search saved successfully',
            search: {
                _id: search._id,
                from: search.from,
                to: search.to,
                departureDate: search.departureDate,
                returnDate: search.returnDate,
                passengers: search.passengers,
                searchedAt: search.searchedAt,
            },
        });
    } catch (error) {
        console.error('Save search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while saving search',
            error: error.message,
        });
    }
};

/**
 * @desc    Get user's search history
 * @route   GET /api/search/history
 * @access  Private
 */
const getSearchHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        // Get user's searches, sorted by most recent
        const searches = await SearchHistory.find({ userId: req.user._id })
            .sort({ searchedAt: -1 })
            .limit(limit)
            .skip(skip)
            .select('-__v');

        // Get total count for pagination
        const total = await SearchHistory.countDocuments({ userId: req.user._id });

        res.status(200).json({
            success: true,
            count: searches.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            searches,
        });
    } catch (error) {
        console.error('Get search history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching search history',
            error: error.message,
        });
    }
};

/**
 * @desc    Clear user's search history
 * @route   DELETE /api/search/history
 * @access  Private
 */
const clearHistory = async (req, res) => {
    try {
        const result = await SearchHistory.deleteMany({ userId: req.user._id });

        res.status(200).json({
            success: true,
            message: 'Search history cleared successfully',
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing history',
            error: error.message,
        });
    }
};

export { saveSearch, getSearchHistory, clearHistory };
