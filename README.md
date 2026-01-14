# 👥 TeamMapper - User-Team Mapping Application

A full-stack, production-ready application for managing user-team mappings with advanced analytics, bulk operations, and real-time insights. Built with Node.js, Express, PostgreSQL, and React.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![Express](https://img.shields.io/badge/Express-4-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Features

### Frontend
- ✨ **Modern Dashboard** - Beautiful, responsive UI with dark theme
- 📊 **Real-time Analytics** - Team lead performance, project distribution, and manager overview
- 🔍 **Advanced Search & Filtering** - Search across all fields with project filters
- 📋 **Pagination** - Efficient data handling with configurable page sizes
- 📥 **Data Export** - Export mappings as CSV or JSON
- 📦 **Bulk Import** - Import multiple mappings at once via CSV
- 📚 **API Documentation** - Built-in API docs viewer
- 🎨 **Professional UI** - Industry-level design with animations and transitions

### Backend
- 🔒 **Production-Ready API** - RESTful endpoints with comprehensive error handling
- 📈 **Analytics Endpoints** - Team distribution, lead performance, and project insights
- 🔍 **Advanced Filtering** - Multi-field search, pagination, and sorting
- 📦 **Bulk Operations** - Transaction-based bulk create operations
- 📥 **Data Export** - CSV and JSON export functionality
- 🛡️ **Security** - SQL injection protection, input validation, CORS configuration
- 📊 **Health Monitoring** - Detailed health checks with database metrics
- 📝 **Auto-Generated Docs** - Self-documenting API with endpoint details
- 🔄 **Request Logging** - Comprehensive logging for debugging and monitoring

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client
- **dotenv** - Environment configuration

### Frontend
- **React** - UI library
- **Axios** - HTTP client
- **CSS3** - Modern styling with CSS variables

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd TeammachingAssignement
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb team_mapping_db

# Or using psql:
psql -U postgres
CREATE DATABASE team_mapping_db;
\q

# Run schema (optional - auto-initializes on first run)
psql -d team_mapping_db -f backend/db/schema.sql
```

### 4. Configure Environment

```bash
cd backend
cp env.example .env
```

Edit `.env` with your database credentials:

```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_mapping_db
DB_USER=your_username
DB_PASSWORD=your_password
```

### 5. Start the Application

**Option 1: Run Both Servers (Recommended)**

```bash
# From root directory
npm run dev
```

**Option 2: Run Separately**

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Docs**: http://localhost:5001/api/docs

## 📖 Usage

### Adding Mappings

1. Navigate to **"Add Mapping"** tab
2. Fill in the form:
   - Team Member ID (required)
   - Team Lead ID (optional)
   - Project Name (required)
   - Project Manager ID (optional)
3. Click **"Create Mapping"**

### Bulk Import

1. Go to **"Bulk Import"** tab
2. Enter mappings in CSV format:
   ```
   user001,lead001,Broadcast,pm001
   user002,lead002,Clarity,pm002
   ```
3. Click **"Import Mappings"**

### Viewing Analytics

1. Click **"Analytics"** tab
2. View:
   - Team Lead Performance
   - Project Manager Overview
   - Project Details

### Exporting Data

1. Go to **"All Mappings"** tab
2. Click **"📥 CSV"** or **"📥 JSON"** buttons
3. File will download automatically

## 🔌 API Endpoints

### Mappings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mappings` | Get all mappings (with pagination, filtering, search) |
| GET | `/api/mappings/simple` | Get all mappings (simple version) |
| GET | `/api/mappings/stats` | Get statistics summary |
| GET | `/api/mappings/analytics/projects` | Get project distribution |
| GET | `/api/mappings/analytics/leads` | Get team lead performance |
| GET | `/api/mappings/analytics/managers` | Get project manager overview |
| GET | `/api/mappings/project/:projectName` | Get members by project |
| GET | `/api/mappings/member/:teamMemberId` | Get projects by member |
| POST | `/api/mappings` | Create a new mapping |
| POST | `/api/mappings/bulk` | Bulk create mappings |
| PUT | `/api/mappings/:id` | Update a mapping |
| DELETE | `/api/mappings/:id` | Delete a mapping |
| GET | `/api/mappings/export/csv` | Export as CSV |
| GET | `/api/mappings/export/json` | Export as JSON |

### Health & Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check with metrics |
| GET | `/api/docs` | API documentation |

### Query Parameters

**GET /api/mappings** supports:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (id, team_member_id, project_name, etc.)
- `sortOrder` - ASC or DESC (default: DESC)
- `projectName` - Filter by project
- `teamLeadId` - Filter by team lead
- `teamMemberId` - Filter by team member
- `projectManagerId` - Filter by PM
- `search` - Search across all fields

### Example API Calls

```bash
# Get paginated mappings
curl "http://localhost:5001/api/mappings?page=1&limit=10&projectName=Broadcast"

# Search mappings
curl "http://localhost:5001/api/mappings?search=user001"

# Get analytics
curl "http://localhost:5001/api/mappings/analytics/projects"

# Create mapping
curl -X POST "http://localhost:5001/api/mappings" \
  -H "Content-Type: application/json" \
  -d '{
    "teamMemberId": "user001",
    "teamLeadId": "lead001",
    "projectName": "Broadcast",
    "projectManagerId": "pm001"
  }'

# Bulk create
curl -X POST "http://localhost:5001/api/mappings/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": [
      {"teamMemberId": "user001", "projectName": "Broadcast"},
      {"teamMemberId": "user002", "projectName": "Clarity"}
    ]
  }'
```

## 📁 Project Structure

```
TeammachingAssignement/
├── backend/
│   ├── db/
│   │   ├── connection.js      # Database connection pool
│   │   ├── init.js            # Database initialization
│   │   └── schema.sql         # Database schema
│   ├── middleware/
│   │   ├── errorHandler.js    # Error handling middleware
│   │   ├── logger.js          # Request logging
│   │   └── validation.js      # Input validation
│   ├── models/
│   │   ├── UserTeamMapping.js # Data model with advanced queries
│   │   └── UserTeamMappingInMemory.js # In-memory fallback
│   ├── routes/
│   │   ├── mappings.js        # Mapping routes
│   │   ├── health.js          # Health check routes
│   │   └── docs.js            # API documentation
│   ├── scripts/
│   │   └── setup-db.sh        # Database setup script
│   ├── seed-data.js           # Seed script for dummy data
│   ├── server.js              # Express server
│   ├── package.json
│   └── .env                   # Environment variables
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Styles
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   └── package.json
├── README.md
├── API_FEATURES.md            # Detailed API features
├── SHOWCASE_FEATURES.md       # Feature showcase guide
└── package.json               # Root package.json
```

## 🎯 Key Features Explained

### Advanced Filtering & Search
- Multi-field search across all columns
- Case-insensitive matching
- Real-time filtering with backend support
- Project-specific filters

### Analytics & Insights
- **Project Distribution**: Member count, lead count per project
- **Team Lead Performance**: Team size, project count, PM count
- **Project Manager Overview**: Total members, projects, leads managed
- **Statistics Summary**: Real-time counts and metrics

### Bulk Operations
- Import up to 100 mappings at once
- Transaction-based (all or nothing)
- Automatic duplicate detection
- CSV format support

### Data Export
- CSV export for spreadsheet applications
- JSON export for programmatic use
- Includes all mapping data
- Downloadable files

### Security Features
- SQL injection protection (parameterized queries)
- Input validation and sanitization
- CORS configuration
- Error message sanitization
- Request size limits

## 🧪 Testing

### Seed Dummy Data

```bash
cd backend
node seed-data.js
```

This will add 8 sample mappings to test the application.

### Test API Endpoints

```bash
# Health check
curl http://localhost:5001/health

# Get all mappings
curl http://localhost:5001/api/mappings

# Get analytics
curl http://localhost:5001/api/mappings/analytics/projects
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5001
cd backend
./kill-port.sh 5001
```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   brew services list  # macOS
   pg_isready          # Check PostgreSQL
   ```

2. Check `.env` file has correct credentials

3. Test connection:
   ```bash
   cd backend
   node test-connection.js
   ```

### Frontend Can't Connect to Backend

1. Verify backend is running on port 5001
2. Check `frontend/src/App.js` has correct `API_URL`
3. Check browser console for CORS errors

## 📊 Database Schema

```sql
CREATE TABLE user_team_mappings (
    id SERIAL PRIMARY KEY,
    team_member_id VARCHAR(255) NOT NULL,
    team_lead_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_manager_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_member_id, project_name)
);
```

## 🎨 Screenshots

### Dashboard
- Real-time statistics cards
- Project distribution charts
- Recent mappings list

### Analytics
- Team lead performance metrics
- Project manager overview
- Project details table

### Mappings Table
- Advanced search and filtering
- Sortable columns
- Pagination controls
- Export buttons

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Built as a full-stack assignment demonstrating:
- RESTful API design
- Database schema and optimization
- Frontend-backend integration
- Production-ready features
- Industry-level code quality

## 🙏 Acknowledgments

- Express.js community
- React team
- PostgreSQL community
- All contributors and testers

## 📚 Additional Documentation

- [API Features](./backend/API_FEATURES.md) - Detailed API documentation
- [Showcase Features](./backend/SHOWCASE_FEATURES.md) - Feature showcase guide
- [Database Info](./DATABASE_INFO.md) - Database setup and information
- [Setup Guide](./SETUP.md) - Detailed setup instructions

## 🚀 Future Enhancements

- [ ] User authentication and authorization
- [ ] Role-based access control
- [ ] Email notifications
- [ ] Advanced reporting and charts
- [ ] Mobile app support
- [ ] Real-time updates with WebSockets
- [ ] Audit logging
- [ ] Data import from external sources

---

⭐ If you find this project helpful, please give it a star!
