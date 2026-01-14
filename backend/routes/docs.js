const express = require('express');
const router = express.Router();

// API Documentation endpoint
router.get('/', (req, res) => {
  const docs = {
    title: 'Team Mapping API Documentation',
    version: '1.0.0',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      mappings: {
        'GET /mappings': {
          description: 'Get all mappings with advanced filtering, pagination, and search',
          queryParams: {
            page: 'Page number (default: 1)',
            limit: 'Items per page (default: 10, max: 100)',
            sortBy: 'Sort field: id, team_member_id, team_lead_id, project_name, project_manager_id, created_at',
            sortOrder: 'Sort order: ASC or DESC (default: DESC)',
            projectName: 'Filter by project name',
            teamLeadId: 'Filter by team lead ID',
            teamMemberId: 'Filter by team member ID',
            projectManagerId: 'Filter by project manager ID',
            search: 'Search across all fields (case-insensitive)'
          },
          example: '/api/mappings?page=1&limit=10&projectName=Broadcast&search=user'
        },
        'GET /mappings/simple': {
          description: 'Get all mappings (simple version, backward compatible)'
        },
        'GET /mappings/stats': {
          description: 'Get statistics summary (total mappings, unique projects, leads, members, etc.)'
        },
        'GET /mappings/analytics/projects': {
          description: 'Get project distribution analytics'
        },
        'GET /mappings/analytics/leads': {
          description: 'Get team lead performance analytics'
        },
        'GET /mappings/analytics/managers': {
          description: 'Get project manager overview analytics'
        },
        'GET /mappings/project/:projectName': {
          description: 'Get all members in a specific project'
        },
        'GET /mappings/member/:teamMemberId': {
          description: 'Get all projects for a specific team member'
        },
        'POST /mappings': {
          description: 'Create a new mapping',
          body: {
            teamMemberId: 'string (required)',
            teamLeadId: 'string (optional)',
            projectName: 'string (required)',
            projectManagerId: 'string (optional)'
          }
        },
        'POST /mappings/bulk': {
          description: 'Bulk create mappings (max 100 at once)',
          body: {
            mappings: 'array of mapping objects'
          }
        },
        'GET /mappings/export/csv': {
          description: 'Export all mappings as CSV file'
        },
        'GET /mappings/export/json': {
          description: 'Export all mappings as JSON file'
        },
        'PUT /mappings/:id': {
          description: 'Update a mapping (can update team_lead_id and project_manager_id)',
          body: {
            team_lead_id: 'string (optional)',
            project_manager_id: 'string (optional)'
          }
        },
        'DELETE /mappings/:id': {
          description: 'Delete a mapping by ID'
        }
      },
      health: {
        'GET /health': {
          description: 'Advanced health check with database metrics, memory usage, and statistics'
        }
      }
    },
    responseFormat: {
      success: {
        success: true,
        data: '...',
        pagination: '... (if applicable)'
      },
      error: {
        success: false,
        error: 'Error message',
        code: 'ERROR_CODE',
        message: 'Detailed message'
      }
    },
    features: [
      'Advanced filtering and search',
      'Pagination support',
      'Sorting capabilities',
      'Bulk operations',
      'Data export (CSV/JSON)',
      'Analytics endpoints',
      'Comprehensive error handling',
      'Request validation',
      'Detailed health checks'
    ]
  };

  res.json(docs);
});

module.exports = router;
