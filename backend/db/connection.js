const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'team_mapping_db',
  user: process.env.DB_USER || process.env.USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
    console.log(`  Database: ${pool.options.database}`);
    console.log(`  Host: ${pool.options.host}:${pool.options.port}`);
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('  Please check your .env file and ensure PostgreSQL is running');
    throw error;
  }
}

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit in production - let the app handle it
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Export both pool and test function
module.exports = pool;
module.exports.testConnection = testConnection;