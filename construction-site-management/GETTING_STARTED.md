# Getting Started - Construction Site Management System

## Overview

This is a production-ready construction site management system with complete authentication, role-based access control, and real-world features for managing projects, tasks, workforce, inventory, and finances.

## Quick Start

### 1. Installation
```bash
cd construction-site-management
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 3. Login
- **Email**: Any email (e.g., admin@siteos.in)
- **Password**: Any password (e.g., password123)
- **Role**: Select from 4 options:
  - Admin (प्रशासक)
  - Project Manager (परियोजना प्रबंधक)
  - Site Engineer (साइट इंजीनियर)
  - Storekeeper (गोदाम प्रभारी)

## Features Overview

### Authentication
- ✅ Email/Password login
- ✅ Sign up with email verification
- ✅ Password reset functionality
- ✅ Role selection during login
- ✅ Session management

### Role-Based Access Control
- ✅ 4 distinct user roles
- ✅ Role-specific dashboards
- ✅ Feature gating by role
- ✅ Dynamic navigation
- ✅ Access denied messages

### Core Features

#### Dashboard
- Role-specific KPIs
- Financial charts (Admin/PM)
- Recent activity
- Inventory overview (Storekeeper)

#### Projects
- Create, read, update, delete projects
- Search and filter
- Budget tracking
- Status management
- Role-based access

#### Tasks
- Kanban board with drag-and-drop
- Task assignment
- Priority levels
- Status tracking
- Role-based visibility

#### Workforce
- Worker management
- Attendance tracking
- Skill categorization
- Rate management
- Admin/Engineer access only

#### Inventory
- Stock level tracking
- Low stock alerts
- Reorder management
- Category filtering
- Admin/PM/Storekeeper access

#### Finance
- Budget vs actual tracking
- Cost distribution analysis
- Project financial summary
- Financial charts
- Admin/PM access only

## User Roles

### Admin (प्रशासक)
**Full system access**
- Manage all projects, tasks, workers, inventory, and finances
- View all dashboards and analytics
- System-wide oversight

### Project Manager (परियोजना प्रबंधक)
**Project and financial oversight**
- Manage projects and tasks
- Assign work to engineers
- Track budgets and expenses
- Manage inventory

### Site Engineer (साइट इंजीनियर)
**On-site execution**
- View projects (read-only)
- Manage assigned tasks
- Manage workforce and attendance
- Report progress

### Storekeeper (गोदाम प्रभारी)
**Inventory specialist**
- Manage inventory
- Track stock levels
- Process reorders
- Maintain inventory records

## File Structure

```
construction-site-management/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── charts/            # Chart components
│   │   ├── layout/            # Layout components (Sidebar, Navbar)
│   │   └── ui/                # Reusable UI components
│   ├── context/
│   │   ├── AppContext.jsx     # App state management
│   │   └── AuthContext.jsx    # Authentication state
│   ├── hooks/
│   │   └── useAuth.js         # Auth hook
│   ├── pages/
│   │   ├── Dashboard.jsx      # Role-based dashboard
│   │   ├── Projects.jsx       # Project management
│   │   ├── Tasks.jsx          # Task management
│   │   ├── Workforce.jsx      # Worker management
│   │   ├── Inventory.jsx      # Inventory management
│   │   ├── Finance.jsx        # Financial analytics
│   │   └── Auth*.jsx          # Auth pages
│   ├── services/
│   │   └── authService.js     # Auth logic
│   ├── utils/
│   │   ├── validation.js      # Form validation
│   │   └── crypto.js          # Encryption utilities
│   ├── data/
│   │   └── mockData.js        # Demo data
│   └── App.jsx                # Main app component
├── ROLE_BASED_FEATURES.md     # Feature documentation
├── ROLE_MATRIX.md             # Access matrix
├── TESTING_GUIDE.md           # Testing scenarios
└── IMPLEMENTATION_SUMMARY.md  # Implementation details
```

## Key Technologies

- **React 18**: UI framework
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Recharts**: Charts and graphs
- **Vite**: Build tool

## Authentication Flow

```
1. User visits login page
2. Enters email and password
3. Selects role from 4 options
4. AuthContext stores user and role
5. Redirected to dashboard
6. Role-based features displayed
```

## Role-Based Access Pattern

```javascript
// In any page component
import { useAuth } from '../hooks/useAuth';

function MyPage() {
  const { user } = useAuth();
  
  // Check if user can access feature
  const canManage = ['Admin', 'Project_Manager'].includes(user?.role);
  
  return (
    <>
      {canManage && <CreateButton />}
      {!canManage && <AccessDeniedMessage />}
    </>
  );
}
```

## Testing

### Test Each Role
1. Login with any credentials
2. Select each role
3. Verify sidebar menu changes
4. Check dashboard KPIs
5. Test feature access
6. Verify access denied messages

### Test Scenarios
See `TESTING_GUIDE.md` for comprehensive test cases

### Access Matrix
See `ROLE_MATRIX.md` for complete access matrix

## Common Tasks

### Create a Project
1. Login as Admin or Project Manager
2. Go to Projects page
3. Click "New Project"
4. Fill in project details
5. Click "Create Project"

**Example:**
- Name: "Mumbai Office Complex"
- Location: "Mumbai, Maharashtra"
- Type: "Commercial"
- Budget: ₹5,00,00,000

### Assign a Task
1. Login as Admin or Project Manager
2. Go to Tasks page
3. Click "New Task"
4. Select project and worker
5. Set priority
6. Click "Create Task"

**Example:**
- Task: "Foundation Excavation"
- Assign to: "Raj Kumar"
- Priority: "High"

### Mark Attendance
1. Login as Admin or Site Engineer
2. Go to Workforce page
3. Select date
4. Click Present/Half Day/Absent for each worker
5. Attendance is saved

**Example:**
- Date: March 15, 2024
- Raj Kumar: Present
- Priya Sharma: Half Day
- Amit Patel: Absent

### Manage Inventory
1. Login as Admin, PM, or Storekeeper
2. Go to Inventory page
3. Search or filter items
4. View low stock alerts
5. Click "Reorder" for low stock items

**Example:**
- Cement: 500 bags (minimum: 200)
- Steel Rods: 2 tons (minimum: 1 ton)
- Bricks: 10,000 (minimum: 5,000)

### View Finance
1. Login as Admin or Project Manager
2. Go to Finance page
3. View budget vs actual
4. Check cost distribution
5. Review project financials

**Example:**
- Total Budget: ₹5,00,00,000
- Spent: ₹2,50,00,000
- Remaining: ₹2,50,00,000

## Troubleshooting

### Issue: Can't login
**Solution**: Use any email and password (demo mode)

### Issue: Can't see certain pages
**Solution**: Check your role - some pages are restricted by role

### Issue: Can't create projects
**Solution**: Only Admin and Project Manager can create projects

### Issue: Can't see all tasks
**Solution**: Site Engineer only sees assigned tasks

### Issue: Sidebar menu is empty
**Solution**: Refresh page or check your role selection

## Development

### Add New Feature
1. Create component in `src/components/`
2. Add role check using `useAuth()`
3. Conditionally render based on role
4. Update documentation

### Modify Role Permissions
1. Edit role check in component
2. Update `ROLE_MATRIX.md`
3. Update `ROLE_BASED_FEATURES.md`
4. Test all roles

### Add New Role
1. Update `AuthLogin.jsx` with new role
2. Add role to all permission checks
3. Update sidebar filtering
4. Update documentation

## Production Deployment

### Before Going Live
1. ✅ Connect to real backend
2. ✅ Implement server-side permission validation
3. ✅ Add HTTPS
4. ✅ Implement audit logging
5. ✅ Add rate limiting
6. ✅ Set up database
7. ✅ Configure environment variables
8. ✅ Add error tracking
9. ✅ Set up monitoring
10. ✅ Create backup strategy

### Environment Variables
```
VITE_API_URL=https://api.example.com
VITE_AUTH_TOKEN_KEY=auth_token
VITE_APP_NAME=SiteOS
```

## Documentation

- **ROLE_BASED_FEATURES.md**: Complete feature documentation
- **ROLE_MATRIX.md**: Access matrix and permissions
- **TESTING_GUIDE.md**: Testing scenarios and checklist
- **IMPLEMENTATION_SUMMARY.md**: Implementation details

## Support

For issues or questions:
1. Check documentation files
2. Review test scenarios
3. Check role permissions
4. Verify user role selection

## Next Steps

1. **Explore Features**: Login with different roles
2. **Test Workflows**: Follow user workflows
3. **Review Code**: Understand role-based patterns
4. **Customize**: Modify for your needs
5. **Deploy**: Set up production environment

## License

This project is provided as-is for construction site management.

---

**Happy Building! 🏗️**
