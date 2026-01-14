// In-memory implementation for testing without database
// To use this, replace the import in routes/mappings.js

class UserTeamMappingInMemory {
  constructor() {
    this.mappings = [];
    this.nextId = 1;
  }

  // Get all mappings
  async getAll() {
    return [...this.mappings];
  }

  // Create a new mapping
  async create(mapping) {
    const { teamMemberId, teamLeadId, projectName, projectManagerId } = mapping;
    
    const newMapping = {
      id: this.nextId++,
      team_member_id: teamMemberId,
      team_lead_id: teamLeadId || '',
      project_name: projectName,
      project_manager_id: projectManagerId || '',
      created_at: new Date().toISOString()
    };
    
    this.mappings.push(newMapping);
    return newMapping;
  }

  // Check if mapping already exists (same user + project)
  async exists(teamMemberId, projectName) {
    return this.mappings.some(
      m => m.team_member_id === teamMemberId && m.project_name === projectName
    );
  }
}

// Export singleton instance
module.exports = new UserTeamMappingInMemory();
