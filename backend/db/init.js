const pool = require('./connection');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    console.log('✓ Database schema initialized successfully');
    
    // Test query to verify table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_team_mappings'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('✓ user_team_mappings table verified');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error.message);
    // Don't throw - table might already exist
    if (error.code === '42P07') {
      console.log('✓ Table already exists, skipping initialization');
      return true;
    }
    throw error;
  }
}

module.exports = initializeDatabase;
