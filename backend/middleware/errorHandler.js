// Advanced error handling middleware

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: 'Duplicate entry',
          message: 'This user is already assigned to this project',
          code: 'DUPLICATE_ENTRY'
        });

      case '23503': // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: 'Invalid reference',
          message: 'Referenced record does not exist',
          code: 'INVALID_REFERENCE'
        });

      case '23502': // Not null constraint violation
        return res.status(400).json({
          success: false,
          error: 'Missing required field',
          message: err.message,
          code: 'MISSING_FIELD'
        });

      case '42P01': // Table does not exist
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Database table not found',
          code: 'TABLE_NOT_FOUND'
        });

      default:
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: err.message,
          code: 'DATABASE_ERROR'
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
    code: 'NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
