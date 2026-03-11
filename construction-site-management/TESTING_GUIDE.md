# Testing Guide - Role-Based Features

## Quick Start

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Navigate to login page** (should be default)

3. **Test each role** by logging in and selecting the role

## Test Scenarios

### Scenario 1: Admin User
**Login Details:**
- Email: admin@example.com
- Password: password123
- Role: Admin

**Expected Behavior:**
- ✅ Dashboard shows all KPI cards (Projects, Tasks, Workers, Low Stock, Budget)
- ✅ Can create, edit, delete projects
- ✅ Can create, edit, delete tasks
- ✅ Can manage workers and attendance
- ✅ Can view and manage inventory
- ✅ Can view financial analytics
- ✅ All sidebar menu items visible

### Scenario 2: Project Manager
**Login Details:**
- Email: pm@example.com
- Password: password123
- Role: Project Manager

**Expected Behavior:**
- ✅ Dashboard shows Projects, Tasks, Low Stock, Budget (no Workers)
- ✅ Can create, edit, delete projects
- ✅ Can create, edit, delete tasks
- ✅ Cannot access Workforce (access denied message)
- ✅ Can view and manage inventory
- ✅ Can view financial analytics
- ✅ Sidebar shows: Dashboard, Projects, Tasks, Inventory, Finance

### Scenario 3: Site Engineer
**Login Details:**
- Email: engineer@example.com
- Password: password123
- Role: Site Engineer

**Expected Behavior:**
- ✅ Dashboard shows Projects, Tasks, Workers (no Budget/Finance)
- ✅ Projects page shows view-only access with lock icon
- ✅ Cannot create new projects
- ✅ Tasks page shows only assigned tasks
- ✅ Can drag-and-drop own tasks to update status
- ✅ Can manage workers and attendance
- ✅ Cannot access Inventory (access denied message)
- ✅ Cannot access Finance (access denied message)
- ✅ Sidebar shows: Dashboard, Projects, Tasks, Workforce

### Scenario 4: Storekeeper
**Login Details:**
- Email: storekeeper@example.com
- Password: password123
- Role: Storekeeper

**Expected Behavior:**
- ✅ Dashboard shows Inventory Overview (Total Items, Low Stock, Total Value)
- ✅ Cannot access Projects (access denied message)
- ✅ Cannot access Tasks (access denied message)
- ✅ Cannot access Workforce (access denied message)
- ✅ Can view and manage inventory
- ✅ Cannot access Finance (access denied message)
- ✅ Sidebar shows: Dashboard, Inventory only

## Feature Testing Checklist

### Dashboard
- [ ] Role-specific KPI cards display correctly
- [ ] Charts only show for Admin and Project Manager
- [ ] Recent tasks visible for all except Storekeeper
- [ ] Storekeeper sees inventory overview
- [ ] User name and role display in header

### Projects
- [ ] Admin can create/edit/delete projects
- [ ] Project Manager can create/edit/delete projects
- [ ] Site Engineer sees view-only message
- [ ] Search and filter work correctly
- [ ] New Project button only visible to managers

### Tasks
- [ ] Admin sees all tasks
- [ ] Project Manager sees all tasks
- [ ] Site Engineer sees only assigned tasks
- [ ] Drag-and-drop works for authorized users
- [ ] New Task button only visible to managers
- [ ] Task creation modal has correct fields

### Workforce
- [ ] Admin can access workforce
- [ ] Site Engineer can access workforce
- [ ] Project Manager sees access denied
- [ ] Storekeeper sees access denied
- [ ] Attendance tracking works
- [ ] Date selector functions properly

### Inventory
- [ ] Admin can access inventory
- [ ] Project Manager can access inventory
- [ ] Storekeeper can access inventory
- [ ] Site Engineer sees access denied
- [ ] Search and filter work
- [ ] Low stock alerts display
- [ ] Reorder buttons visible for low stock items

### Finance
- [ ] Admin can access finance
- [ ] Project Manager can access finance
- [ ] Site Engineer sees access denied
- [ ] Storekeeper sees access denied
- [ ] Charts display correctly
- [ ] Budget calculations accurate
- [ ] Cost distribution shows all categories

## Common Issues & Solutions

### Issue: All roles see all features
**Solution:** Check that useAuth hook is properly imported and user role is being read from AuthContext

### Issue: Sidebar shows wrong menu items
**Solution:** Verify Sidebar.jsx is using useAuth and filtering items by user.role

### Issue: Access denied message not showing
**Solution:** Ensure Lock icon is imported from lucide-react and conditional rendering is correct

### Issue: Tasks not filtering by Site Engineer
**Solution:** Check that task.assigned_to matches user.id (may need to verify data structure)

## Performance Notes

- Role-based filtering uses useMemo to prevent unnecessary re-renders
- Access control checks are lightweight (simple array includes)
- No additional API calls for role validation (client-side only)

## Demo Data

The application uses mock data from `src/data/mockData.js`. All roles can use the same demo credentials with any email/password combination.

## Next Steps

1. **Backend Integration**: Connect to real authentication system
2. **Database**: Store user roles and permissions in database
3. **API Validation**: Validate permissions on backend for security
4. **Audit Logging**: Log all actions by role and user
5. **Custom Permissions**: Allow fine-grained permission control
