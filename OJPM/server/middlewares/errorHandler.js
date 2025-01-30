// middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Log the error details for debugging (in production, you might want to log to a file or monitoring service)
    console.error(err);
  
    // Set a default status code and message if not provided
    const statusCode = res.statusCode || 500;
    const message = err.message || 'Something went wrong. Please try again later.';
    
    // If the error is an instance of a custom Error class, you can access its properties
    if (err.name === 'ValidationError') {
      res.status(400).json({
        message: 'Validation Error',
        details: err.errors,
      });
    } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
      res.status(400).json({
        message: 'Invalid Object ID format',
      });
    } else {
      res.status(statusCode).json({
        message: message,
      });
    }
  };
  
  module.exports = errorHandler;
  