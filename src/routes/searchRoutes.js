import express from 'express';
import { body } from 'express-validator';
import {
    saveSearch,
    getSearchHistory,
    clearHistory,
} from '../controllers/searchController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Validation middleware for saving search
 */
const saveSearchValidation = [
    body('from')
        .trim()
        .notEmpty()
        .withMessage('Departure location is required'),
    body('to')
        .trim()
        .notEmpty()
        .withMessage('Destination is required'),
    body('departureDate')
        .notEmpty()
        .withMessage('Departure date is required')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('returnDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid return date format'),
    body('passengers')
        .optional()
        .isInt({ min: 1, max: 9 })
        .withMessage('Passengers must be between 1 and 9'),
];

// ==========================================
// ALL ROUTES ARE PROTECTED
// ==========================================

/**
 * @route   POST /api/search/save
 * @desc    Save a flight search
 * @access  Private
 */
router.post('/save', protect, saveSearchValidation, saveSearch);

/**
 * @route   GET /api/search/history
 * @desc    Get user's search history
 * @access  Private
 * @query   limit (default: 20), page (default: 1)
 */
router.get('/history', protect, getSearchHistory);

/**
 * @route   DELETE /api/search/history
 * @desc    Clear user's search history
 * @access  Private
 */
router.delete('/history', protect, clearHistory);

export default router;
