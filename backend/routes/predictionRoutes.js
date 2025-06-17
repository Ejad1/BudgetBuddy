const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); // Correction du chemin
const { 
  getSpendingPrediction,
  getAnomalyDetection,
  getBudgetOptimization,
  getBehavioralNudges,
  getBenchmarking 
} = require('../controllers/predictionController');

// @route   GET /api/predictions/spending
// @desc    Get spending predictions for the user
// @access  Private
router.get('/spending', protect, getSpendingPrediction);

// @route   GET /api/predictions/anomaly-detection
// @desc    Get anomaly detection for the user
// @access  Private
router.get('/anomaly-detection', protect, getAnomalyDetection);

// @route   GET /api/predictions/budget-optimization
// @desc    Get budget optimization suggestions for the user
// @access  Private
router.get('/budget-optimization', protect, getBudgetOptimization);

// @route   GET /api/predictions/behavioral-nudges
// @desc    Get behavioral nudges for the user
// @access  Private
router.get('/behavioral-nudges', protect, getBehavioralNudges);

// @route   GET /api/predictions/benchmarking
// @desc    Get anonymous benchmarking data
// @access  Private
router.get('/benchmarking', protect, getBenchmarking);

module.exports = router;
