-- Create database (run this manually or via psql)
-- CREATE DATABASE team_mapping_db;

-- UserTeamMapping table
CREATE TABLE IF NOT EXISTS user_team_mappings (
    id SERIAL PRIMARY KEY,
    team_member_id VARCHAR(255) NOT NULL,
    team_lead_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_manager_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_member_id, project_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_name ON user_team_mappings(project_name);
CREATE INDEX IF NOT EXISTS idx_team_member_id ON user_team_mappings(team_member_id);
