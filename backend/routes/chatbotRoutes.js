const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middlewares/authMiddleware'); // Using authMiddleware for consistency

// POST /api/chatbot/query
// Route to get a response from the chatbot
router.post('/query', protect, chatbotController.getChatbotResponse);

module.exports = router;
