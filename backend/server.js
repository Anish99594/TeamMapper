const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/connection');
const { testConnection } = require('./db/connection');
const initializeDatabase = require('./db/init');
const mappingsRouter = require('./routes/mappings');
const healthRouter = require('./routes/health');
const docsRouter = require('./routes/docs');
const logger = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Advanced request logging
app.use(logger);

// Routes
app.use('/api/mappings', mappingsRouter);
app.use('/health', healthRouter);
app.use('/api/docs', docsRouter);

// API Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api/docs');
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database schema
    await initializeDatabase();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api/mappings\n`);
    });

    // Handle server errors (like port already in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n✗ Port ${PORT} is already in use`);
        console.error(`  Please either:`);
        console.error(`  1. Stop the process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
        console.error(`  2. Use a different port by setting PORT in .env file\n`);
      } else {
        console.error('\n✗ Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('\n✗ Failed to start server:', error.message);
    if (error.message.includes('database') || error.message.includes('connection')) {
      console.error('  Please check your database configuration in .env file\n');
    }
    process.exit(1);
  }
}

startServer();
