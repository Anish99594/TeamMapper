const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const UserTeamMapping = require('../models/UserTeamMapping');

// Advanced health check with detailed metrics
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as time, version() as version');
    const dbResponseTime = Date.now() - startTime;

    // Get database statistics
    const dbStats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM user_team_mappings) as total_mappings,
        (SELECT COUNT(DISTINCT project_name) FROM user_team_mappings) as unique_projects,
        pg_database_size(current_database()) as db_size
    `);

    // Get application statistics
    const appStats = await UserTeamMapping.getStatistics();

    // Calculate uptime (if available)
    const uptime = process.uptime();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime)
      },
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`,
        version: dbTest.rows[0].version.split(' ')[0] + ' ' + dbTest.rows[0].version.split(' ')[1],
        size: formatBytes(parseInt(dbStats.rows[0].db_size)),
        stats: {
          totalMappings: parseInt(dbStats.rows[0].total_mappings),
          uniqueProjects: parseInt(dbStats.rows[0].unique_projects)
        }
      },
      application: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        memory: {
          used: formatBytes(process.memoryUsage().heapUsed),
          total: formatBytes(process.memoryUsage().heapTotal),
          rss: formatBytes(process.memoryUsage().rss)
        },
        stats: appStats
      }
    };

    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    });
  }
});

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = router;
