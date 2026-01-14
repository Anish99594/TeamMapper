// Quick test script to verify database connection
require('dotenv').config();
const pool = require('./db/connection');
const { testConnection } = require('./db/connection');
const initializeDatabase = require('./db/init');

async function test() {
  try {
    console.log('Testing database connection...\n');
    await testConnection();
    await initializeDatabase();
    console.log('\n✓ All tests passed! Database is ready.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  }
}

test();
