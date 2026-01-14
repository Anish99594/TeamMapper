import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function App() {
  const [mappings, setMappings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    stats: null,
    projects: [],
    leads: [],
    managers: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // API Documentation
  const [apiDocs, setApiDocs] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    teamMemberId: '',
    teamLeadId: '',
    projectName: '',
    projectManagerId: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  
  // Bulk operations
  const [bulkData, setBulkData] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Fetch mappings with backend filtering
  const fetchMappings = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterProject !== 'all') params.projectName = filterProject;
      
      const response = await axios.get(`${API_URL}/mappings`, { params });
      
      if (response.data.pagination) {
        setMappings(response.data.data || []);
        setPagination(response.data.pagination);
      } else {
        // Fallback for simple endpoint
        const data = response.data.data || response.data;
        setMappings(Array.isArray(data) ? data : []);
        setPagination({ page: 1, limit: data.length, total: data.length, totalPages: 1 });
      }
      setError(null);
    } catch (err) {
      setError('Failed to load mappings. Make sure the backend server is running.');
      console.error('Error fetching mappings:', err);
      setMappings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const [statsRes, projectsRes, leadsRes, managersRes] = await Promise.all([
        axios.get(`${API_URL}/mappings/stats`),
        axios.get(`${API_URL}/mappings/analytics/projects`),
        axios.get(`${API_URL}/mappings/analytics/leads`),
        axios.get(`${API_URL}/mappings/analytics/managers`)
      ]);
      
      setAnalytics({
        stats: statsRes.data.data,
        projects: projectsRes.data.data || [],
        leads: leadsRes.data.data || [],
        managers: managersRes.data.data || []
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch all projects for filter dropdown
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/mappings/analytics/projects`);
      return (response.data.data || []).map(p => p.project_name);
    } catch (err) {
      return [];
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [currentPage, pageSize, sortBy, sortOrder, searchTerm, filterProject]);

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'analytics') {
      fetchAnalytics();
    }
    if (activeTab === 'docs') {
      fetchDocs();
    }
  }, [activeTab]);

  // Fetch API documentation
  const fetchDocs = async () => {
    try {
      setDocsLoading(true);
      const response = await axios.get(`${API_URL}/docs`);
      setApiDocs(response.data);
    } catch (err) {
      console.error('Error fetching docs:', err);
      setApiDocs(null);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleSort = (key) => {
    const sortKeyMap = {
      'id': 'id',
      'team_member_id': 'team_member_id',
      'team_lead_id': 'team_lead_id',
      'project_name': 'project_name',
      'project_manager_id': 'project_manager_id',
      'created_at': 'created_at'
    };
    
    const newSortBy = sortKeyMap[key] || 'created_at';
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(newSortBy);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await axios.post(`${API_URL}/mappings`, formData);
      setSubmitSuccess(response.data.message || 'Mapping created successfully!');
      setFormData({
        teamMemberId: '',
        teamLeadId: '',
        projectName: '',
        projectManagerId: ''
      });
      fetchMappings();
      fetchAnalytics();
    } catch (err) {
      if (err.response) {
        setSubmitError(err.response.data.error || 'Failed to create mapping');
      } else {
        setSubmitError('Network error. Make sure the backend server is running.');
      }
      console.error('Error creating mapping:', err);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');

    try {
      const lines = bulkData.split('\n').filter(line => line.trim());
      const mappings = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          teamMemberId: parts[0] || '',
          teamLeadId: parts[1] || '',
          projectName: parts[2] || '',
          projectManagerId: parts[3] || ''
        };
      }).filter(m => m.teamMemberId && m.projectName);

      if (mappings.length === 0) {
        setBulkError('Please provide valid mappings in CSV format: teamMemberId,teamLeadId,projectName,projectManagerId');
        return;
      }

      const response = await axios.post(`${API_URL}/mappings/bulk`, { mappings });
      setBulkSuccess(`Successfully created ${response.data.created} of ${response.data.total} mappings!`);
      setBulkData('');
      fetchMappings();
      fetchAnalytics();
    } catch (err) {
      if (err.response) {
        setBulkError(err.response.data.error || 'Failed to bulk create mappings');
      } else {
        setBulkError('Network error. Make sure the backend server is running.');
      }
      console.error('Error bulk creating mappings:', err);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${API_URL}/mappings/export/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mappings.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export data');
      console.error('Error exporting:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleProjectFilter = (e) => {
    setFilterProject(e.target.value);
    setCurrentPage(1);
  };

  const stats = analytics.stats || {
    totalMappings: mappings.length,
    uniqueProjects: new Set(mappings.map(m => m.project_name)).size,
    uniqueLeads: new Set(mappings.map(m => m.team_lead_id).filter(Boolean)).size,
    uniqueMembers: new Set(mappings.map(m => m.team_member_id)).size
  };

  const projectDistribution = analytics.projects.length > 0
    ? analytics.projects.reduce((acc, p) => {
        acc[p.project_name] = parseInt(p.member_count);
        return acc;
      }, {})
    : {};

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">👥</div>
            <h1>TeamMapper</h1>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📈</span>
            <span>Analytics</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'mappings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mappings')}
          >
            <span className="nav-icon">📋</span>
            <span>All Mappings</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <span className="nav-icon">➕</span>
            <span>Add Mapping</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            <span className="nav-icon">📦</span>
            <span>Bulk Import</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            <span className="nav-icon">📚</span>
            <span>API Docs</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <h2 className="page-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'analytics' && 'Analytics & Insights'}
            {activeTab === 'mappings' && 'Team Mappings'}
            {activeTab === 'add' && 'Add New Mapping'}
            {activeTab === 'bulk' && 'Bulk Import'}
            {activeTab === 'docs' && 'API Documentation'}
          </h2>
          <div className="top-bar-actions">
            {(activeTab === 'mappings') && (
              <>
                <button className="export-btn" onClick={() => handleExport('csv')} title="Export CSV">
                  📥 CSV
                </button>
                <button className="export-btn" onClick={() => handleExport('json')} title="Export JSON">
                  📥 JSON
                </button>
              </>
            )}
            <button className="refresh-btn" onClick={() => { fetchMappings(); fetchAnalytics(); }} title="Refresh">
              🔄
            </button>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {analyticsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Statistics Cards */}
                <div className="stats-grid">
                  <div className="stat-card stat-primary">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                      <h3>{stats.totalMappings || 0}</h3>
                      <p>Total Mappings</p>
                    </div>
                  </div>
                  <div className="stat-card stat-success">
                    <div className="stat-icon">🚀</div>
                    <div className="stat-info">
                      <h3>{stats.uniqueProjects || 0}</h3>
                      <p>Active Projects</p>
                    </div>
                  </div>
                  <div className="stat-card stat-warning">
                    <div className="stat-icon">👨‍💼</div>
                    <div className="stat-info">
                      <h3>{stats.uniqueLeads || 0}</h3>
                      <p>Team Leads</p>
                    </div>
                  </div>
                  <div className="stat-card stat-info">
                    <div className="stat-icon">👤</div>
                    <div className="stat-info">
                      <h3>{stats.uniqueMembers || 0}</h3>
                      <p>Team Members</p>
                    </div>
                  </div>
                </div>

                {/* Project Distribution */}
                {analytics.projects.length > 0 && (
                  <div className="dashboard-section">
                    <h3>Project Distribution</h3>
                    <div className="project-chart">
                      {analytics.projects.map((project) => {
                        const percentage = stats.totalMappings > 0 
                          ? (parseInt(project.member_count) / stats.totalMappings) * 100 
                          : 0;
                        return (
                          <div key={project.project_name} className="project-bar-item">
                            <div className="project-bar-header">
                              <span className="project-name">{project.project_name}</span>
                              <span className="project-count">
                                {project.member_count} members, {project.lead_count} leads
                              </span>
                            </div>
                            <div className="project-bar">
                              <div
                                className="project-bar-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Mappings */}
                <div className="dashboard-section">
                  <h3>Recent Mappings</h3>
                  <div className="recent-mappings">
                    {mappings.slice(0, 5).map((mapping) => (
                      <div key={mapping.id} className="recent-item">
                        <div className="recent-item-icon">👤</div>
                        <div className="recent-item-info">
                          <strong>{mapping.team_member_id}</strong>
                          <span>→ {mapping.project_name}</span>
                        </div>
                        <div className="recent-item-time">
                          {new Date(mapping.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                    {mappings.length === 0 && (
                      <div className="empty-state">No mappings yet</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-content">
            {analyticsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading analytics...</p>
              </div>
            ) : (
              <>
                <div className="analytics-grid">
                  {/* Team Lead Performance */}
                  <div className="analytics-card">
                    <h3>Team Lead Performance</h3>
                    <div className="analytics-list">
                      {analytics.leads.map((lead) => (
                        <div key={lead.team_lead_id} className="analytics-item">
                          <div className="analytics-item-header">
                            <strong>{lead.team_lead_id}</strong>
                            <span className="analytics-badge">{lead.team_size} members</span>
                          </div>
                          <div className="analytics-item-details">
                            <span>{lead.project_count} projects</span>
                            <span>•</span>
                            <span>{lead.pm_count} PMs</span>
                          </div>
                        </div>
                      ))}
                      {analytics.leads.length === 0 && (
                        <div className="empty-state">No team leads data</div>
                      )}
                    </div>
                  </div>

                  {/* Project Manager Overview */}
                  <div className="analytics-card">
                    <h3>Project Manager Overview</h3>
                    <div className="analytics-list">
                      {analytics.managers.map((manager) => (
                        <div key={manager.project_manager_id} className="analytics-item">
                          <div className="analytics-item-header">
                            <strong>{manager.project_manager_id}</strong>
                            <span className="analytics-badge">{manager.total_members} members</span>
                          </div>
                          <div className="analytics-item-details">
                            <span>{manager.project_count} projects</span>
                            <span>•</span>
                            <span>{manager.lead_count} leads</span>
                          </div>
                        </div>
                      ))}
                      {analytics.managers.length === 0 && (
                        <div className="empty-state">No project manager data</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="analytics-card">
                  <h3>Project Details</h3>
                  <div className="project-details-table">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Members</th>
                          <th>Leads</th>
                          <th>PMs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.projects.map((project) => (
                          <tr key={project.project_name}>
                            <td><span className="badge badge-project">{project.project_name}</span></td>
                            <td>{project.member_count}</td>
                            <td>{project.lead_count}</td>
                            <td>{project.pm_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Mappings Tab */}
        {activeTab === 'mappings' && (
          <div className="mappings-content">
            {/* Filters */}
            <div className="filters-bar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                />
              </div>
              <select
                className="filter-select"
                value={filterProject}
                onChange={handleProjectFilter}
              >
                <option value="all">All Projects</option>
                {analytics.projects.map(project => (
                  <option key={project.project_name} value={project.project_name}>
                    {project.project_name}
                  </option>
                ))}
              </select>
              <select
                className="filter-select"
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>

            {/* Table */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading mappings...</p>
              </div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : mappings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No mappings found</p>
                <button className="btn-primary" onClick={() => setActiveTab('add')}>
                  Add Your First Mapping
                </button>
              </div>
            ) : (
              <>
                <div className="table-container">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('id')} className="sortable">
                          ID {sortBy === 'id' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('team_member_id')} className="sortable">
                          Team Member {sortBy === 'team_member_id' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('team_lead_id')} className="sortable">
                          Team Lead {sortBy === 'team_lead_id' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('project_name')} className="sortable">
                          Project {sortBy === 'project_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('project_manager_id')} className="sortable">
                          Project Manager {sortBy === 'project_manager_id' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => handleSort('created_at')} className="sortable">
                          Created At {sortBy === 'created_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((mapping) => (
                        <tr key={mapping.id}>
                          <td className="id-cell">{mapping.id}</td>
                          <td>
                            <span className="badge badge-member">{mapping.team_member_id}</span>
                          </td>
                          <td>{mapping.team_lead_id || <span className="text-muted">-</span>}</td>
                          <td>
                            <span className="badge badge-project">{mapping.project_name}</span>
                          </td>
                          <td>{mapping.project_manager_id || <span className="text-muted">-</span>}</td>
                          <td className="date-cell">
                            {new Date(mapping.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {pagination.page || currentPage} of {pagination.totalPages || 1} 
                    ({pagination.total || 0} total)
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= (pagination.totalPages || 1)}
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Add Mapping Tab */}
        {activeTab === 'add' && (
          <div className="form-content">
            <div className="form-card">
              <h3>Create New Team Mapping</h3>
              <form onSubmit={handleSubmit} className="modern-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="teamMemberId">
                      Team Member ID <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="teamMemberId"
                      name="teamMemberId"
                      value={formData.teamMemberId}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., user123"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="teamLeadId">Team Lead ID</label>
                    <input
                      type="text"
                      id="teamLeadId"
                      name="teamLeadId"
                      value={formData.teamLeadId}
                      onChange={handleInputChange}
                      placeholder="e.g., lead456"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectName">
                      Project Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Broadcast, Clarity"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="projectManagerId">Project Manager ID</label>
                    <input
                      type="text"
                      id="projectManagerId"
                      name="projectManagerId"
                      value={formData.projectManagerId}
                      onChange={handleInputChange}
                      placeholder="e.g., pm789"
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  <span>➕</span> Create Mapping
                </button>

                {submitError && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="alert alert-success">
                    <span>✅</span> {submitSuccess}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Tab */}
        {activeTab === 'bulk' && (
          <div className="form-content">
            <div className="form-card">
              <h3>Bulk Import Mappings</h3>
              <p className="form-help">
                Enter mappings in CSV format (one per line):<br/>
                <code>teamMemberId,teamLeadId,projectName,projectManagerId</code>
              </p>
              <form onSubmit={handleBulkSubmit} className="modern-form">
                <div className="form-group">
                  <label htmlFor="bulkData">Mappings (CSV format)</label>
                  <textarea
                    id="bulkData"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    className="form-textarea"
                    rows="10"
                    placeholder="user001,lead001,Broadcast,pm001&#10;user002,lead002,Clarity,pm002"
                  />
                </div>

                <button type="submit" className="btn-submit">
                  <span>📦</span> Import Mappings
                </button>

                {bulkError && (
                  <div className="alert alert-error">
                    <span>⚠️</span> {bulkError}
                  </div>
                )}

                {bulkSuccess && (
                  <div className="alert alert-success">
                    <span>✅</span> {bulkSuccess}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* API Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="docs-content">
            {docsLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading documentation...</p>
              </div>
            ) : apiDocs ? (
              <div className="docs-container">
                <div className="docs-header">
                  <h2>{apiDocs.title}</h2>
                  <p className="docs-version">Version {apiDocs.version}</p>
                  <p className="docs-base-url">Base URL: <code>{apiDocs.baseUrl}</code></p>
                </div>

                <div className="docs-section">
                  <h3>Features</h3>
                  <ul className="docs-features">
                    {apiDocs.features?.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="docs-section">
                  <h3>Endpoints</h3>
                  
                  {/* Mappings Endpoints */}
                  <div className="endpoint-group">
                    <h4>Mappings API</h4>
                    {Object.entries(apiDocs.endpoints?.mappings || {}).map(([endpoint, details]) => (
                      <div key={endpoint} className="endpoint-card">
                        <div className="endpoint-header">
                          <span className="endpoint-method">GET</span>
                          <span className="endpoint-path">{endpoint}</span>
                        </div>
                        <p className="endpoint-description">{details.description}</p>
                        {details.queryParams && (
                          <div className="endpoint-params">
                            <strong>Query Parameters:</strong>
                            <ul>
                              {Object.entries(details.queryParams).map(([param, desc]) => (
                                <li key={param}><code>{param}</code>: {desc}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {details.body && (
                          <div className="endpoint-body">
                            <strong>Request Body:</strong>
                            <pre>{JSON.stringify(details.body, null, 2)}</pre>
                          </div>
                        )}
                        {details.example && (
                          <div className="endpoint-example">
                            <strong>Example:</strong>
                            <code>{details.example}</code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Health Endpoints */}
                  <div className="endpoint-group">
                    <h4>Health Check</h4>
                    {Object.entries(apiDocs.endpoints?.health || {}).map(([endpoint, details]) => (
                      <div key={endpoint} className="endpoint-card">
                        <div className="endpoint-header">
                          <span className="endpoint-method">GET</span>
                          <span className="endpoint-path">{endpoint}</span>
                        </div>
                        <p className="endpoint-description">{details.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="docs-section">
                  <h3>Response Format</h3>
                  <div className="response-format">
                    <div className="format-card">
                      <h5>Success Response</h5>
                      <pre>{JSON.stringify(apiDocs.responseFormat?.success, null, 2)}</pre>
                    </div>
                    <div className="format-card">
                      <h5>Error Response</h5>
                      <pre>{JSON.stringify(apiDocs.responseFormat?.error, null, 2)}</pre>
                    </div>
                  </div>
                </div>

                <div className="docs-footer">
                  <p>For more details, visit: <code>{apiDocs.baseUrl}/docs</code></p>
                </div>
              </div>
            ) : (
              <div className="error-state">
                Failed to load documentation. Make sure the backend server is running.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
