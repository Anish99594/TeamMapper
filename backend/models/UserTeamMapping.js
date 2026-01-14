const pool = require('../db/connection');

class UserTeamMapping {
  // Get all mappings with advanced filtering, pagination, and sorting
  static async getAll(options = {}) {
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
    } = options;

    let query = 'SELECT * FROM user_team_mappings WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Apply filters
    if (projectName) {
      paramCount++;
      query += ` AND project_name = $${paramCount}`;
      params.push(projectName);
    }

    if (teamLeadId) {
      paramCount++;
      query += ` AND team_lead_id = $${paramCount}`;
      params.push(teamLeadId);
    }

    if (teamMemberId) {
      paramCount++;
      query += ` AND team_member_id = $${paramCount}`;
      params.push(teamMemberId);
    }

    if (projectManagerId) {
      paramCount++;
      query += ` AND project_manager_id = $${paramCount}`;
      params.push(projectManagerId);
    }

    // Search across multiple fields
    if (search) {
      paramCount++;
      query += ` AND (
        team_member_id ILIKE $${paramCount} OR
        team_lead_id ILIKE $${paramCount} OR
        project_name ILIKE $${paramCount} OR
        project_manager_id ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
    }

    // Validate sort column to prevent SQL injection
    const validSortColumns = ['id', 'team_member_id', 'team_lead_id', 'project_name', 'project_manager_id', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortColumn} ${order}`;

    // Get total count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Apply pagination
    const offset = (page - 1) * limit;
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);
    
    return {
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Get all mappings (simple version for backward compatibility)
  static async getAllSimple() {
    const query = 'SELECT * FROM user_team_mappings ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Create a new mapping
  static async create(mapping) {
    const { teamMemberId, teamLeadId, projectName, projectManagerId } = mapping;
    
    const query = `
      INSERT INTO user_team_mappings (team_member_id, team_lead_id, project_name, project_manager_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [teamMemberId, teamLeadId, projectName, projectManagerId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Bulk create mappings
  static async bulkCreate(mappings) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const created = [];

      for (const mapping of mappings) {
        const { teamMemberId, teamLeadId, projectName, projectManagerId } = mapping;
        
        // Check if exists
        const exists = await client.query(
          'SELECT * FROM user_team_mappings WHERE team_member_id = $1 AND project_name = $2',
          [teamMemberId, projectName]
        );

        if (exists.rows.length === 0) {
          const result = await client.query(
            `INSERT INTO user_team_mappings (team_member_id, team_lead_id, project_name, project_manager_id)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [teamMemberId, teamLeadId || '', projectName, projectManagerId || '']
          );
          created.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');
      return created;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Check if mapping already exists (same user + project)
  static async exists(teamMemberId, projectName) {
    const query = `
      SELECT * FROM user_team_mappings 
      WHERE team_member_id = $1 AND project_name = $2
    `;
    const result = await pool.query(query, [teamMemberId, projectName]);
    return result.rows.length > 0;
  }

  // Get analytics: Project distribution
  static async getProjectDistribution() {
    const query = `
      SELECT 
        project_name,
        COUNT(*) as member_count,
        COUNT(DISTINCT team_lead_id) as lead_count,
        COUNT(DISTINCT project_manager_id) as pm_count
      FROM user_team_mappings
      GROUP BY project_name
      ORDER BY member_count DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get analytics: Team lead performance
  static async getLeadPerformance() {
    const query = `
      SELECT 
        team_lead_id,
        COUNT(*) as team_size,
        COUNT(DISTINCT project_name) as project_count,
        COUNT(DISTINCT project_manager_id) as pm_count
      FROM user_team_mappings
      WHERE team_lead_id != ''
      GROUP BY team_lead_id
      ORDER BY team_size DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get analytics: Project manager overview
  static async getProjectManagerOverview() {
    const query = `
      SELECT 
        project_manager_id,
        COUNT(*) as total_members,
        COUNT(DISTINCT project_name) as project_count,
        COUNT(DISTINCT team_lead_id) as lead_count
      FROM user_team_mappings
      WHERE project_manager_id != ''
      GROUP BY project_manager_id
      ORDER BY total_members DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get statistics summary
  static async getStatistics() {
    const queries = {
      totalMappings: 'SELECT COUNT(*) as count FROM user_team_mappings',
      uniqueProjects: 'SELECT COUNT(DISTINCT project_name) as count FROM user_team_mappings',
      uniqueLeads: 'SELECT COUNT(DISTINCT team_lead_id) as count FROM user_team_mappings WHERE team_lead_id != \'\'',
      uniqueMembers: 'SELECT COUNT(DISTINCT team_member_id) as count FROM user_team_mappings',
      uniquePMs: 'SELECT COUNT(DISTINCT project_manager_id) as count FROM user_team_mappings WHERE project_manager_id != \'\'',
      recentMappings: 'SELECT COUNT(*) as count FROM user_team_mappings WHERE created_at > NOW() - INTERVAL \'7 days\''
    };

    const stats = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      stats[key] = parseInt(result.rows[0].count);
    }

    return stats;
  }

  // Get members by project
  static async getMembersByProject(projectName) {
    const query = `
      SELECT * FROM user_team_mappings
      WHERE project_name = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [projectName]);
    return result.rows;
  }

  // Get projects by team member
  static async getProjectsByMember(teamMemberId) {
    const query = `
      SELECT * FROM user_team_mappings
      WHERE team_member_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [teamMemberId]);
    return result.rows;
  }

  // Delete mapping
  static async delete(id) {
    const query = 'DELETE FROM user_team_mappings WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update mapping
  static async update(id, updates) {
    const allowedFields = ['team_lead_id', 'project_manager_id'];
    const updatesArray = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        paramCount++;
        updatesArray.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updatesArray.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    values.push(id);

    const query = `
      UPDATE user_team_mappings
      SET ${updatesArray.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = UserTeamMapping;
