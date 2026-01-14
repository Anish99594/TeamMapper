const express = require('express');
const router = express.Router();
const UserTeamMapping = require('../models/UserTeamMapping');
const { validateMapping, validatePagination } = require('../middleware/validation');

// GET /api/mappings - Get all mappings with advanced filtering, pagination, and search
router.get('/', validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      projectName,
      teamLeadId,
      teamMemberId,
      projectManagerId,
      search
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      projectName,
      teamLeadId,
      teamMemberId,
      projectManagerId,
      search
    };

    const result = await UserTeamMapping.getAll(options);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error fetching mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mappings',
      message: error.message
    });
  }
});

// GET /api/mappings/simple - Get all mappings (simple version, backward compatible)
router.get('/simple', async (req, res) => {
  try {
    const mappings = await UserTeamMapping.getAllSimple();
    res.json({
      success: true,
      count: mappings.length,
      data: mappings
    });
  } catch (error) {
    console.error('Error fetching mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mappings',
      message: error.message
    });
  }
});

// GET /api/mappings/stats - Get statistics summary
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserTeamMapping.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// GET /api/mappings/analytics/projects - Get project distribution analytics
router.get('/analytics/projects', async (req, res) => {
  try {
    const distribution = await UserTeamMapping.getProjectDistribution();
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching project analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project analytics',
      message: error.message
    });
  }
});

// GET /api/mappings/analytics/leads - Get team lead performance analytics
router.get('/analytics/leads', async (req, res) => {
  try {
    const leads = await UserTeamMapping.getLeadPerformance();
    res.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead analytics',
      message: error.message
    });
  }
});

// GET /api/mappings/analytics/managers - Get project manager overview
router.get('/analytics/managers', async (req, res) => {
  try {
    const managers = await UserTeamMapping.getProjectManagerOverview();
    res.json({
      success: true,
      data: managers
    });
  } catch (error) {
    console.error('Error fetching manager analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch manager analytics',
      message: error.message
    });
  }
});

// GET /api/mappings/project/:projectName - Get all members in a project
router.get('/project/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params;
    const members = await UserTeamMapping.getMembersByProject(projectName);
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project members',
      message: error.message
    });
  }
});

// GET /api/mappings/member/:teamMemberId - Get all projects for a team member
router.get('/member/:teamMemberId', async (req, res) => {
  try {
    const { teamMemberId } = req.params;
    const projects = await UserTeamMapping.getProjectsByMember(teamMemberId);
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching member projects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member projects',
      message: error.message
    });
  }
});

// POST /api/mappings - Create a new mapping
router.post('/', validateMapping, async (req, res) => {
  try {
    const { teamMemberId, teamLeadId, projectName, projectManagerId } = req.body;

    // Validation: Prevent duplicate user-project combinations
    const exists = await UserTeamMapping.exists(teamMemberId, projectName);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'This user is already assigned to this project',
        code: 'DUPLICATE_MAPPING'
      });
    }

    // Create the mapping
    const mapping = await UserTeamMapping.create({
      teamMemberId,
      teamLeadId: teamLeadId || '',
      projectName,
      projectManagerId: projectManagerId || ''
    });

    res.status(201).json({
      success: true,
      message: 'Mapping created successfully',
      data: mapping
    });
  } catch (error) {
    console.error('Error creating mapping:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'This user is already assigned to this project',
        code: 'DUPLICATE_MAPPING'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create mapping',
      message: error.message
    });
  }
});

// POST /api/mappings/bulk - Bulk create mappings
router.post('/bulk', async (req, res) => {
  try {
    const { mappings } = req.body;

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'mappings must be a non-empty array'
      });
    }

    if (mappings.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create more than 100 mappings at once'
      });
    }

    // Validate each mapping
    for (const mapping of mappings) {
      if (!mapping.teamMemberId || !mapping.projectName) {
        return res.status(400).json({
          success: false,
          error: 'Each mapping must have teamMemberId and projectName'
        });
      }
    }

    const created = await UserTeamMapping.bulkCreate(mappings);

    res.status(201).json({
      success: true,
      message: `Successfully created ${created.length} of ${mappings.length} mappings`,
      created: created.length,
      total: mappings.length,
      data: created
    });
  } catch (error) {
    console.error('Error bulk creating mappings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk create mappings',
      message: error.message
    });
  }
});

// GET /api/mappings/export/csv - Export mappings as CSV
router.get('/export/csv', async (req, res) => {
  try {
    const mappings = await UserTeamMapping.getAllSimple();
    
    // Generate CSV
    const headers = ['ID', 'Team Member ID', 'Team Lead ID', 'Project Name', 'Project Manager ID', 'Created At'];
    const rows = mappings.map(m => [
      m.id,
      m.team_member_id,
      m.team_lead_id || '',
      m.project_name,
      m.project_manager_id || '',
      new Date(m.created_at).toISOString()
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=mappings.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV',
      message: error.message
    });
  }
});

// GET /api/mappings/export/json - Export mappings as JSON
router.get('/export/json', async (req, res) => {
  try {
    const mappings = await UserTeamMapping.getAllSimple();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=mappings.json');
    res.json({
      success: true,
      count: mappings.length,
      exportedAt: new Date().toISOString(),
      data: mappings
    });
  } catch (error) {
    console.error('Error exporting JSON:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export JSON',
      message: error.message
    });
  }
});

// PUT /api/mappings/:id - Update a mapping
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await UserTeamMapping.update(id, updates);

    res.json({
      success: true,
      message: 'Mapping updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mapping',
      message: error.message
    });
  }
});

// DELETE /api/mappings/:id - Delete a mapping
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserTeamMapping.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Mapping not found'
      });
    }

    res.json({
      success: true,
      message: 'Mapping deleted successfully',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting mapping:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete mapping',
      message: error.message
    });
  }
});

module.exports = router;
