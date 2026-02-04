/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Socket error handler
 */
const handleSocketError = (socket, error) => {
  console.error('❌ Socket error:', error);
  socket.emit('error', {
    message: error.message || 'Socket error occurred',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFound,
  handleSocketError
};