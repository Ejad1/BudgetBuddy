const errorHandler = (err, req, res, next) => {
  // Determine status code: use the statusCode set on the response, or default to 500 (Internal Server Error)
  const statusCode = res.statusCode ? res.statusCode : 500;

  res.status(statusCode);

  console.error('ERROR STACK:', err.stack); // Log the stack trace for debugging

  res.json({
    message: err.message, // Send the error message
    // Optionally include stack trace in development environment
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
}; 