# Role-Based Features Implementation

## Overview
The Construction Site Management System now includes comprehensive role-based access control and customized features for each user role. Users select their role during login and see only the features and data relevant to their position.

## Roles & Permissions

### 1. Admin
**Full system access with all features**

- **Dashboard**: All KPIs (Projects, Active Tasks, Workers, Low Stock, Budget)
- **Projects**: Full CRUD operations (Create, Read, Update, Delete)
- **Tasks**: Full task management with drag-and-drop
- **Workforce**: Full worker management and attendance tracking
- **Inventory**: Full inventory management with reorder capabilities
- **Finance**: Complete financial analytics and budget tracking

### 2. Project Manager
**Project and financial oversight**

- **Dashboard**: Projects, Active Tasks, Low Stock Items, Total Budget
- **Projects**: Full CRUD operations (Create, Read, Update, Delete)
- **Tasks**: Full task management and assignment
- **Workforce**: No access (view-only message)
- **Inventory**: View and manage inventory, reorder items
- **Finance**: Complete financial analytics and budget tracking

### 3. Site Engineer
**On-site task and workforce management**

- **Dashboard**: Projects, Active Tasks, Active Workers
- **Projects**: View-only access (cannot create/edit/delete)
- **Tasks**: Only see and manage their assigned tasks
- **Workforce**: Full worker management and attendance tracking
- **Inventory**: No access (view-only message)
- **Finance**: No access (view-only message)

### 4. Storekeeper
**Inventory management specialist**

- **Dashboard**: Inventory overview (Total Items, Low Stock, Total Value)
- **Projects**: No access (view-only message)
- **Tasks**: No access (view-only message)
- **Workforce**: No access (view-only message)
- **Inventory**: Full inventory management with reorder capabilities
- **Finance**: No access (view-only message)

## Feature Details by Page

### Dashboard
- **Role-specific KPI cards**: Each role sees only relevant metrics
- **Admin**: All KPIs displayed
- **Project Manager**: Projects, Active Tasks, Low Stock, Budget
- **Site Engineer**: Projects, Active Tasks, Workers
- **Storekeeper**: Inventory overview with total value calculation
- **Charts**: Only Admin and Project Manager see financial charts
- **Recent Tasks**: All roles except Storekeeper see task updates

### Projects
- **Admin & Project Manager**: Full CRUD with create/edit/delete buttons
- **Site Engineer**: View-only with lock icon notification
- **Storekeeper**: No access
- **Search & Filter**: Available for all roles with access
- **Action Buttons**: Only visible to users with management permissions

### Tasks
- **Admin & Project Manager**: Create new tasks, manage all tasks
- **Site Engineer**: Only see and update their assigned tasks
- **Drag-and-Drop**: Enabled only for users who can edit tasks
- **Task Creation**: Modal only visible to Project Manager and Admin
- **Storekeeper**: No access

### Workforce
- **Admin & Site Engineer**: Full access to worker management and attendance
- **Project Manager**: Access denied with notification
- **Storekeeper**: Access denied with notification
- **Attendance Tracking**: Date-based attendance marking
- **Worker Management**: Add, edit, delete workers

### Inventory
- **Admin, Project Manager, Storekeeper**: Full access
- **Site Engineer**: Access denied with notification
- **Storekeeper**: Primary user for this section
- **Low Stock Alerts**: Automatic reorder notifications
- **Search & Filter**: By item name and category

### Finance
- **Admin & Project Manager**: Full access to all financial data
- **Site Engineer**: Access denied with notification
- **Storekeeper**: Access denied with notification
- **Budget Tracking**: Project-wise budget vs actual expenses
- **Cost Distribution**: Labor, Material, Equipment, Other costs
- **Financial Charts**: Pie charts and budget analysis

## Implementation Details

### Authentication Flow
1. User logs in with email and password
2. User selects their role from 4 options
3. Role is stored in AuthContext
4. useAuth hook provides role information to all pages

### Access Control Pattern
```javascript
// Check if user can access feature
const canManageProjects = ['Admin', 'Project_Manager'].includes(user?.role);

// Conditionally render UI
{canManageProjects && (
  <Button>Create Project</Button>
)}

// Show access denied message
{!canManageProjects && (
  <Card className="bg-rose-500/10 border border-rose-500/50">
    <p>You don't have access to this section</p>
  </Card>
)}
```

### Data Filtering Pattern
```javascript
// Filter data based on role
const visibleTasks = useMemo(() => {
  if (user?.role === 'Site_Engineer') {
    return tasks.filter(t => t.assigned_to === user?.id);
  }
  return tasks;
}, [tasks, user?.role, user?.id]);
```

## User Experience Enhancements

### Visual Indicators
- Lock icons show restricted access
- Role-specific descriptions in headers
- Color-coded access denied messages
- Conditional button visibility

### Navigation
- Sidebar automatically filters menu items by role
- Only accessible pages appear in navigation
- Navbar shows current user role

### Feedback
- Clear messages when access is denied
- Helpful instructions for limited access users
- Contextual help text for role-specific features

## Testing the Roles

### Admin Login
- Email: any email
- Password: any password
- Role: Admin
- Expected: Full access to all features

### Project Manager Login
- Email: any email
- Password: any password
- Role: Project Manager
- Expected: Projects, Tasks, Inventory, Finance access

### Site Engineer Login
- Email: any email
- Password: any password
- Role: Site Engineer
- Expected: Projects (view-only), Tasks (assigned only), Workforce access

### Storekeeper Login
- Email: any email
- Password: any password
- Role: Storekeeper
- Expected: Inventory access only

## Future Enhancements

1. **Backend Integration**: Connect to real database for persistent role-based data
2. **Permissions API**: Server-side permission validation
3. **Audit Logging**: Track actions by role and user
4. **Custom Roles**: Allow creation of custom role definitions
5. **Time-based Access**: Restrict access by time periods
6. **Department-based Filtering**: Filter data by department/project assignment
7. **Approval Workflows**: Role-based approval chains for critical actions
