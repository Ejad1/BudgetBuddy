require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Needed for serving static files

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Import category routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const predictionRoutes = require('./routes/predictionRoutes'); // Import prediction routes
const chatbotRoutes = require('./routes/chatbotRoutes'); // Import chatbot routes
const { errorHandler } = require('./middlewares/errorHandler'); // Assuming errorHandler exports named function

// Initialize Express App
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust in production)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve receipt files statically
// Assuming receipts are stored in 'backend/uploads/receipts'
app.use('/uploads/receipts', express.static(path.join(__dirname, 'uploads/receipts')));
// Serve profile picture files statically
app.use('/uploads/profile_pictures', express.static(path.join(__dirname, 'uploads/profile_pictures')));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('BudgetBuddy API Running'); // Simple check route
});
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes); // Use category routes
app.use('/api/user', userRoutes); // Use user routes for profile updates
app.use('/api/predictions', predictionRoutes); // Use prediction routes
app.use('/api/chatbot', chatbotRoutes); // Use chatbot routes

// Error Handling Middleware (Should be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));