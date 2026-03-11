# Implementation Plan: Construction Site Management System

## Overview

This plan implements the frontend-only Construction Site Management System using React 19, Vite, Tailwind CSS, React Router v6, Recharts, and Lucide React. The implementation follows a bottom-up approach: starting with project setup, then building reusable UI components, followed by layout components, Context API state management, page components, and finally integration with routing and testing.

**Important**: This is frontend-only implementation using mock data and Context API. No backend API integration is included.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Vite project with React 19
  - Install dependencies: react-router-dom, tailwindcss, recharts, lucide-react
  - Configure Tailwind CSS with custom color palette (slate-950, slate-900, amber-500, etc.)
  - Set up project directory structure: src/components/{layout,ui,charts}, src/pages, src/context, src/data, src/utils
  - Configure ESLint and prettier for code quality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 15.1, 15.2, 15.5, 15.6_

- [x] 2. Create reusable UI components
  - [x] 2.1 Implement Button component
    - Create Button.jsx with variants (primary, secondary, danger) and sizes (sm, md, lg)
    - Apply Tailwind classes for design system colors and hover states
    - _Requirements: 2.4, 2.12, 13.1, 20.1, 20.2_
  
  - [x] 2.2 Implement Input component
    - Create Input.jsx with label, error state, and validation support
    - Support input types: text, number, date, email
    - _Requirements: 2.8, 2.9, 13.2, 19.2_
  
  - [x] 2.3 Implement Select component
    - Create Select.jsx with label and options array
    - Apply consistent styling with Input component
    - _Requirements: 13.3_
  
  - [x] 2.4 Implement Card component
    - Create Card.jsx with title prop and children
    - Apply bg-slate-900, rounded-xl, p-6, border-slate-800
    - _Requirements: 2.2, 2.3, 2.10, 2.11, 13.4_
  
  - [x] 2.5 Implement Badge component
    - Create Badge.jsx with variants (status, success, warning, danger)
    - Apply color-coded backgrounds and text colors
    - _Requirements: 2.5, 2.6, 2.7, 13.5_
  
  - [x] 2.6 Implement Modal component
    - Create Modal.jsx with overlay, close button, ESC key handler, and click-outside-to-close
    - Apply backdrop-blur-sm and bg-slate-900 for content
    - _Requirements: 13.6_
  
  - [x] 2.7 Implement Table component
    - Create Table.jsx with columns prop and data array
    - Support custom render functions for columns
    - Apply hover states and responsive horizontal scroll
    - _Requirements: 13.7, 14.6_

- [x] 3. Create chart components
  - [x] 3.1 Implement BudgetChart component
    - Create BudgetChart.jsx using Recharts BarChart
    - Display Budget vs Actual bars for each project
    - Apply design system colors (amber-500 for budget, slate-600 for actual)
    - Include CartesianGrid, XAxis, YAxis, Tooltip, and Legend
    - _Requirements: 16.1, 16.2, 16.5, 16.6, 16.7_
  
  - [x] 3.2 Implement CostDistributionChart component
    - Create CostDistributionChart.jsx using Recharts PieChart
    - Display Labor vs Material cost distribution
    - Apply design system colors and custom label rendering
    - _Requirements: 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 4. Implement Context API and mock data layer
  - [x] 4.1 Create mock data seed file
    - Create src/data/mockData.js with sample data for all entities
    - Include 3-5 users with different roles
    - Include 4-6 projects with varied types and statuses
    - Include 8-10 tasks across different projects
    - Include 6-8 workers with different skills
    - Include 8-10 inventory items with some below min stock
    - Include 10-15 finance records across projects
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 4.2 Implement AppContext provider
    - Create src/context/AppContext.jsx with Context and Provider
    - Initialize state with mock data arrays
    - Implement authentication state (currentUser, isAuthenticated)
    - _Requirements: 4.7, 18.1, 18.2, 18.3_
  
  - [x] 4.3 Implement Context CRUD actions
    - Implement login(userId) and logout() functions
    - Implement switchRole(newRole) function
    - Implement addProject, updateProject, deleteProject functions
    - Implement addTask and updateTaskStatus functions
    - Implement updateWorkerAttendance function
    - Implement issueMaterial and addProcurement functions
    - Implement addFinanceRecord function
    - _Requirements: 4.8, 18.4_
  
  - [ ]* 4.4 Write property test for Context data structure integrity
    - **Property 1: Context Data Structure Integrity**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
    - Use fast-check to generate random entities and verify all required fields exist with correct types

- [x] 5. Create layout components
  - [x] 5.1 Implement Sidebar component
    - Create Sidebar.jsx with navigation items
    - Implement role-based navigation visibility logic
    - Apply active route highlighting (bg-amber-500)
    - Include Lucide React icons for each menu item
    - Implement collapse/expand functionality for mobile
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 14.4, 17.3_
  
  - [ ]* 5.2 Write property test for role-based navigation visibility
    - **Property 2: Role-Based Navigation Visibility**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
    - Test all role combinations against navigation items to verify access matrix
  
  - [x] 5.3 Implement Navbar component
    - Create Navbar.jsx with title, date, notification icon, and user menu
    - Display "SiteOS Enterprise" in text-amber-500
    - Implement user dropdown with Profile, Switch Role, and Logout options
    - _Requirements: 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [x] 5.4 Implement AppLayout component
    - Create AppLayout.jsx with Sidebar, Navbar, and Outlet
    - Apply fixed positioning for sidebar and navbar
    - Implement responsive layout with mobile breakpoints
    - _Requirements: 6.2, 6.3, 6.9, 14.1, 14.2, 14.3_

- [x] 6. Checkpoint - Verify component rendering
  - Ensure all UI, chart, and layout components render without errors, ask the user if questions arise.

- [x] 7. Implement Dashboard page
  - [x] 7.1 Create Dashboard page structure
    - Create Dashboard.jsx with Bento grid layout
    - Implement responsive grid that stacks on mobile
    - _Requirements: 7.1, 14.5_
  
  - [x] 7.2 Implement KPI cards
    - Create four KPI cards: Total Projects, Active Workers, Low Stock Items, Total Budget
    - Calculate metrics from Context data
    - Apply Card component with appropriate styling
    - _Requirements: 7.2_
  
  - [x] 7.3 Integrate BudgetChart
    - Add BudgetChart component to Dashboard
    - Pass project data with budget and calculated actual expenses
    - _Requirements: 7.3_
  
  - [x] 7.4 Implement recent tasks list
    - Display 5 most recent tasks with name, project, and status badge
    - Use Table component for consistent styling
    - _Requirements: 7.4_
  
  - [ ]* 7.5 Write unit tests for Dashboard
    - Test KPI calculations with various data sets
    - Test chart data transformation
    - Test responsive layout behavior
    - _Requirements: 7.5_

- [x] 8. Implement Projects page
  - [x] 8.1 Create Projects page structure
    - Create Projects.jsx with table, search bar, filter dropdown, and "New Project" button
    - _Requirements: 8.1, 8.3, 8.4, 8.5_
  
  - [x] 8.2 Implement projects table
    - Display all projects with columns: Name, Location, Type, Start Date, Budget, Status
    - Use Table component with custom column renderers
    - _Requirements: 8.2_
  
  - [x] 8.3 Implement search and filter functionality
    - Add search input that filters by project name or location
    - Add filter dropdown for project type
    - Update table display based on filters
    - _Requirements: 8.3, 8.4_
  
  - [x] 8.4 Implement new project modal and form
    - Create modal with form fields: Project Name, Location, Project Type, Start Date, End Date, Budget
    - Implement form validation for required fields
    - Wire form submission to Context addProject function
    - Close modal and clear form on successful submission
    - _Requirements: 8.6, 8.7, 8.8, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_
  
  - [ ]* 8.5 Write property test for project form submission
    - **Property 8: Project Form Submission**
    - **Validates: Requirements 8.8**
    - Generate random valid project data and verify it appears in projects array after submission
  
  - [ ]* 8.6 Write unit tests for Projects page
    - Test search filtering with various queries
    - Test project type filtering
    - Test modal open/close behavior
    - Test form validation errors

- [x] 9. Implement Tasks page
  - [x] 9.1 Create Tasks page with kanban board structure
    - Create Tasks.jsx with three columns: Open, In Progress, Completed
    - Apply column styling with bg-slate-900 cards
    - _Requirements: 9.1_
  
  - [x] 9.2 Implement task cards
    - Create task card component displaying task name, project name, and assigned user
    - Apply Card component styling
    - _Requirements: 9.3_
  
  - [x] 9.3 Implement drag and drop functionality
    - Add HTML5 drag and drop handlers (onDragStart, onDragOver, onDrop)
    - Implement visual dragging state (opacity-50)
    - Implement drop target highlighting (border-amber-500)
    - Wire drop event to Context updateTaskStatus function
    - _Requirements: 9.2, 9.4, 20.3_
  
  - [ ]* 9.4 Write property test for task status update on drag
    - **Property 10: Task Status Update on Drag**
    - **Validates: Requirements 9.4**
    - Verify updateTaskStatus is called with correct parameters when task is moved
  
  - [ ]* 9.5 Write unit tests for Tasks page
    - Test task card rendering with complete data
    - Test drag and drop state changes
    - Test status update after drop

- [x] 10. Implement Workforce page
  - [x] 10.1 Create Workforce page structure
    - Create Workforce.jsx with workers table
    - _Requirements: 10.1_
  
  - [x] 10.2 Implement workers table with attendance controls
    - Display columns: Name, Skill, Contact, Rate Type, Base Rate, Attendance
    - Add three attendance buttons per row: Present, Half Day, Absent
    - Apply active state styling (bg-emerald-500) for selected attendance
    - Wire button clicks to Context updateWorkerAttendance function
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [ ]* 10.3 Write property test for attendance update
    - **Property 13: Attendance Update on Button Click**
    - **Validates: Requirements 10.4**
    - Verify updateWorkerAttendance is called with correct workerId, status, and date
  
  - [ ]* 10.4 Write unit tests for Workforce page
    - Test attendance button state changes
    - Test attendance data persistence in context

- [x] 11. Implement Inventory page
  - [x] 11.1 Create Inventory page structure
    - Create Inventory.jsx with inventory table
    - _Requirements: 11.1_
  
  - [x] 11.2 Implement inventory table with low stock indicators
    - Display columns: Item Name, Category, Unit Cost, Current Stock, Min Stock, Actions
    - Implement low stock logic: current_stock < min_stock_qty
    - Apply row highlighting (bg-rose-500/10) for low stock items
    - Display warning icon (AlertTriangle from Lucide) for low stock
    - Display "Reorder" button for low stock items
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 11.3 Write property test for low stock indicator consistency
    - **Property 15: Low Stock Indicator Consistency**
    - **Validates: Requirements 11.3, 11.4, 11.5**
    - Verify all three indicators appear when current_stock < min_stock_qty
  
  - [ ]* 11.4 Write unit tests for Inventory page
    - Test low stock highlighting with various stock levels
    - Test reorder button visibility

- [x] 12. Implement Finance page
  - [x] 12.1 Create Finance page structure
    - Create Finance.jsx with cost distribution chart and budget table
    - _Requirements: 12.1_
  
  - [x] 12.2 Integrate CostDistributionChart
    - Calculate total labor costs from finance records
    - Calculate total material costs from finance records
    - Pass data to CostDistributionChart component
    - _Requirements: 12.1_
  
  - [x] 12.3 Implement project budget table
    - Display one row per project with columns: Project, Budget, Total Cost, Remaining Budget
    - Calculate Total Cost by summing finance records per project
    - Calculate Remaining Budget as Budget - Total Cost
    - Apply color coding: text-emerald-500 for positive, text-rose-500 for negative
    - _Requirements: 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 12.4 Write property test for finance calculations accuracy
    - **Property 17: Finance Calculations Accuracy**
    - **Validates: Requirements 12.4, 12.5**
    - Verify Total Cost equals sum of finance records and Remaining Budget equals Budget - Total Cost
  
  - [ ]* 12.5 Write unit tests for Finance page
    - Test cost distribution calculation with various finance records
    - Test budget table calculations with edge cases (zero budget, negative remaining)

- [x] 13. Checkpoint - Verify all pages render correctly
  - Ensure all pages render without errors and display mock data correctly, ask the user if questions arise.

- [x] 14. Implement routing and navigation
  - [x] 14.1 Set up React Router configuration
    - Create router in App.jsx with routes for all pages
    - Define root route ("/") to redirect to Dashboard
    - Wrap routes with AppLayout for authenticated pages
    - _Requirements: 17.1, 17.2, 17.5_
  
  - [x] 14.2 Implement protected routes with role-based access
    - Create ProtectedRoute component that checks user role
    - Redirect unauthorized users to Dashboard
    - Apply ProtectedRoute to Projects, Tasks, Workforce, Inventory, and Finance routes
    - _Requirements: 5.7, 5.8_
  
  - [ ]* 14.3 Write property test for unauthorized route redirection
    - **Property 3: Unauthorized Route Redirection**
    - **Validates: Requirements 5.7**
    - Test all role/route combinations to verify proper redirection
  
  - [x] 14.4 Implement navigation state persistence
    - Verify context state persists during route transitions
    - Test browser back/forward buttons
    - _Requirements: 17.6_
  
  - [ ]* 14.5 Write unit tests for routing
    - Test route navigation without page reload
    - Test protected route access control
    - Test active route highlighting in sidebar

- [x] 15. Implement authentication flow
  - [x] 15.1 Create Login page
    - Create Login.jsx with user selection (simulate login)
    - Display list of available users from mock data
    - Wire user selection to Context login function
    - Redirect to Dashboard after successful login
    - _Requirements: 4.7_
  
  - [ ]* 15.2 Write property test for login state update
    - **Property 4: Login State Update**
    - **Validates: Requirements 4.7**
    - Verify login function updates currentUser and isAuthenticated correctly
  
  - [x] 15.3 Implement logout functionality
    - Wire Navbar logout button to Context logout function
    - Clear currentUser and redirect to Login page
    - _Requirements: 4.7_
  
  - [x] 15.4 Implement switch role functionality
    - Create role switcher in Navbar dropdown
    - Wire to Context switchRole function
    - Update navigation visibility based on new role
    - _Requirements: 4.7_

- [x] 16. Implement responsive design
  - [x] 16.1 Add mobile breakpoint styles
    - Implement hamburger menu for Sidebar on mobile (<768px)
    - Stack Bento grid cards vertically on mobile
    - Make tables horizontally scrollable on mobile
    - _Requirements: 14.3, 14.4, 14.5, 14.6_
  
  - [x] 16.2 Test responsive behavior
    - Verify layout at 320px, 768px, 1024px, and 1920px widths
    - Test sidebar collapse/expand on mobile
    - Test chart responsiveness
    - _Requirements: 14.1, 14.2, 14.3, 16.7_

- [x] 17. Implement interactive feedback and polish
  - [x] 17.1 Add CSS transitions to interactive elements
    - Add transition classes to buttons, cards, and badges
    - Implement smooth hover and active states
    - _Requirements: 2.12, 20.5_
  
  - [x] 17.2 Add loading states (optional for mock data)
    - Add loading indicators for future API integration points
    - _Requirements: 20.6_
  
  - [x] 17.3 Verify immediate UI updates
    - Test that all CRUD operations update UI without manual refresh
    - Verify Context state changes trigger re-renders
    - _Requirements: 20.4_

- [ ] 18. Testing setup and core property tests
  - [ ] 18.1 Set up testing framework
    - Install and configure Vitest, React Testing Library, and fast-check
    - Create test utilities and custom render functions
    - Set up coverage reporting
    - _Requirements: 15.1, 15.2_
  
  - [ ]* 18.2 Write property test for Context CRUD operations
    - **Property 5: Context CRUD Operations**
    - **Validates: Requirements 4.8**
    - Test all CRUD functions with randomly generated valid entities
  
  - [ ]* 18.3 Write property test for dashboard accessibility
    - **Property 6: Dashboard Accessibility**
    - **Validates: Requirements 7.5**
    - Verify Dashboard renders for all user roles
  
  - [ ]* 18.4 Write property test for projects table completeness
    - **Property 7: Projects Table Completeness**
    - **Validates: Requirements 8.1**
    - Verify all projects in context appear in table
  
  - [ ]* 18.5 Write property test for task card display completeness
    - **Property 9: Task Card Display Completeness**
    - **Validates: Requirements 9.3**
    - Verify task cards display all required fields
  
  - [ ]* 18.6 Write property test for workers table completeness
    - **Property 11: Workers Table Completeness**
    - **Validates: Requirements 10.1**
    - Verify all workers in context appear in table
  
  - [ ]* 18.7 Write property test for worker attendance controls
    - **Property 12: Worker Attendance Controls**
    - **Validates: Requirements 10.3**
    - Verify each worker row has three attendance buttons
  
  - [ ]* 18.8 Write property test for inventory table completeness
    - **Property 14: Inventory Table Completeness**
    - **Validates: Requirements 11.1**
    - Verify all inventory items in context appear in table
  
  - [ ]* 18.9 Write property test for finance table project mapping
    - **Property 16: Finance Table Project Mapping**
    - **Validates: Requirements 12.2**
    - Verify each project has exactly one row in finance table
  
  - [ ]* 18.10 Write property test for chart labeling completeness
    - **Property 18: Chart Labeling Completeness**
    - **Validates: Requirements 16.6**
    - Verify all charts include required labels and legends
  
  - [ ]* 18.11 Write property test for active route highlighting
    - **Property 19: Active Route Highlighting**
    - **Validates: Requirements 17.3**
    - Verify active route is highlighted in sidebar
  
  - [ ]* 18.12 Write property test for client-side navigation
    - **Property 20: Client-Side Navigation**
    - **Validates: Requirements 17.4**
    - Verify navigation doesn't trigger page reload
  
  - [ ]* 18.13 Write property test for navigation state persistence
    - **Property 21: Navigation State Persistence**
    - **Validates: Requirements 17.6**
    - Verify context state persists during route transitions
  
  - [ ]* 18.14 Write property test for context state change re-rendering
    - **Property 22: Context State Change Re-rendering**
    - **Validates: Requirements 18.4**
    - Verify components re-render when consumed context state changes
  
  - [ ]* 18.15 Write property test for required field validation
    - **Property 23: Required Field Validation**
    - **Validates: Requirements 19.2**
    - Verify forms display errors and prevent submission for empty required fields
  
  - [ ]* 18.16 Write property test for successful form submission behavior
    - **Property 24: Successful Form Submission Behavior**
    - **Validates: Requirements 19.3, 19.4, 19.5, 19.6**
    - Verify modal closes, context updates, table displays new record, and form clears
  
  - [ ]* 18.17 Write property test for button hover state
    - **Property 25: Button Hover State**
    - **Validates: Requirements 20.1**
    - Verify buttons display hover state color change
  
  - [ ]* 18.18 Write property test for button click visual feedback
    - **Property 26: Button Click Visual Feedback**
    - **Validates: Requirements 20.2**
    - Verify buttons display visual click effect
  
  - [ ]* 18.19 Write property test for task card drag visual state
    - **Property 27: Task Card Drag Visual State**
    - **Validates: Requirements 20.3**
    - Verify task cards display dragging state during drag
  
  - [ ]* 18.20 Write property test for immediate UI update on data change
    - **Property 28: Immediate UI Update on Data Change**
    - **Validates: Requirements 20.4**
    - Verify UI reflects data changes immediately without manual refresh

- [x] 19. Final integration and polish
  - [x] 19.1 Verify all requirements are met
    - Review requirements document and check each acceptance criterion
    - Test all user flows end-to-end
    - _Requirements: All_
  
  - [x] 19.2 Code cleanup and documentation
    - Add JSDoc comments to complex functions
    - Remove console.logs and debug code
    - Ensure consistent code formatting
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [x] 19.3 Create utility helper functions
    - Create src/utils/helpers.js with date formatting and calculation utilities
    - Implement currency formatting function
    - Implement date formatting function
    - _Requirements: 15.5_

- [x] 20. Final checkpoint - Complete testing and verification
  - Run all tests (unit and property tests), ensure 80%+ coverage, verify all features work correctly, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and user interactions
- This is a frontend-only implementation - all data operations use Context API with mock data
- The implementation follows a bottom-up approach: UI components → Layout → Context → Pages → Integration
- Checkpoints ensure incremental validation at key milestones
