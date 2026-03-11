# Requirements Document

## Introduction

The Construction Site Management System (SiteOS Enterprise) is a production-quality frontend application designed to manage construction projects, workforce, inventory, tasks, and finances. The system provides role-based access control for four user types (Admin, Project Manager, Site Engineer, Storekeeper) and delivers a modern enterprise SaaS experience with a dark industrial aesthetic.

## Glossary

- **System**: The Construction Site Management System frontend application
- **User**: Any authenticated person using the system with an assigned role
- **Admin**: User role with full system access including workforce and finance management
- **Project_Manager**: User role with access to projects, tasks, inventory, and finance
- **Site_Engineer**: User role with access to projects, tasks, and workforce
- **Storekeeper**: User role with access to inventory management only
- **Project**: A construction project with location, budget, timeline, and associated tasks
- **Task**: A work item assigned to a user within a project with status tracking
- **Worker**: A construction workforce member with skill type and rate information
- **Inventory_Item**: A material or supply tracked in the system with stock levels
- **Finance_Record**: A financial transaction associated with a project and cost category
- **Context_Provider**: React Context API implementation serving as the frontend data layer
- **Protected_Route**: A route component that enforces role-based access control
- **KPI_Card**: Key Performance Indicator display component showing summary metrics
- **Bento_Grid**: A modern dashboard layout pattern with varied card sizes
- **Modal**: An overlay dialog component for forms and confirmations
- **Badge**: A small status indicator component with color coding

## Requirements

### Requirement 1: Technology Stack Compliance

**User Story:** As a developer, I want the system built with specific modern technologies, so that it meets performance and maintainability standards

#### Acceptance Criteria

1. THE System SHALL use React 19 as the UI framework
2. THE System SHALL use Vite as the build tool
3. THE System SHALL use Tailwind CSS for styling
4. THE System SHALL use React Router v6 for navigation
5. THE System SHALL use Recharts for data visualization
6. THE System SHALL use Lucide React for icons
7. THE System SHALL implement all components as functional components with hooks
8. THE System SHALL use Context API for global state management
9. THE System SHALL NOT include Material UI, Ant Design, or other heavy UI frameworks

### Requirement 2: Design System Implementation

**User Story:** As a user, I want a consistent dark industrial aesthetic, so that the interface feels professional and cohesive

#### Acceptance Criteria

1. THE System SHALL use bg-slate-950 as the main background color
2. THE System SHALL use bg-slate-900 for card surfaces
3. THE System SHALL use border-slate-800 for borders
4. THE System SHALL use bg-amber-500 with hover:bg-amber-600 for primary buttons
5. THE System SHALL use text-emerald-500 for success states
6. THE System SHALL use text-yellow-500 for warning states
7. THE System SHALL use text-rose-500 for danger states
8. THE System SHALL use text-slate-50 for primary text
9. THE System SHALL use text-slate-400 for secondary text
10. THE System SHALL apply rounded-xl to card components
11. THE System SHALL use p-6 spacing for card interiors
12. THE System SHALL include smooth transitions on interactive elements

### Requirement 3: Project Structure Organization

**User Story:** As a developer, I want a modular component structure, so that the codebase is maintainable and scalable

#### Acceptance Criteria

1. THE System SHALL organize layout components in src/components/layout directory
2. THE System SHALL organize reusable UI components in src/components/ui directory
3. THE System SHALL organize chart components in src/components/charts directory
4. THE System SHALL organize page components in src/pages directory
5. THE System SHALL place context providers in src/context directory
6. THE System SHALL place mock data in src/data directory
7. THE System SHALL include AppLayout, Sidebar, and Navbar in layout components
8. THE System SHALL include Button, Input, Select, Card, Table, Badge, and Modal in UI components

### Requirement 4: Mock Data Layer

**User Story:** As a developer, I want a simulated database using Context API, so that the application functions without a backend

#### Acceptance Criteria

1. THE Context_Provider SHALL maintain an array of Users with id, name, role, email, and phone fields
2. THE Context_Provider SHALL maintain an array of Projects with id, project_name, site_location, project_type, start_date, end_date, and budget fields
3. THE Context_Provider SHALL maintain an array of Tasks with id, task_name, projectId, assigned_to, and status fields
4. THE Context_Provider SHALL maintain an array of Workers with id, name, skill_type, contact, rate_type, and base_rate fields
5. THE Context_Provider SHALL maintain an array of Inventory_Items with id, item_name, category, uom, unit_cost, min_stock_qty, and current_stock fields
6. THE Context_Provider SHALL maintain an array of Finance_Records with id, projectId, cost_category, amount, and date fields
7. THE Context_Provider SHALL provide a login function accepting userId
8. THE Context_Provider SHALL provide functions for addProject, addTask, updateTaskStatus, updateWorkerAttendance, issueMaterial, and addProcurement

### Requirement 5: Role-Based Access Control

**User Story:** As a system administrator, I want role-based navigation restrictions, so that users only access authorized features

#### Acceptance Criteria

1. THE System SHALL display Dashboard navigation to all roles
2. THE System SHALL display Projects navigation to Admin, Project_Manager, and Site_Engineer roles only
3. THE System SHALL display Tasks navigation to Project_Manager and Site_Engineer roles only
4. THE System SHALL display Workforce navigation to Admin and Site_Engineer roles only
5. THE System SHALL display Inventory navigation to Admin, Project_Manager, and Storekeeper roles only
6. THE System SHALL display Finance navigation to Admin and Project_Manager roles only
7. WHEN a User attempts to access an unauthorized route, THE System SHALL redirect to the Dashboard page
8. THE System SHALL implement Protected_Route components using React Router v6

### Requirement 6: Application Layout Structure

**User Story:** As a user, I want a consistent layout with navigation and header, so that I can easily navigate the system

#### Acceptance Criteria

1. THE System SHALL display a Sidebar on the left side of the viewport
2. THE System SHALL display a Navbar at the top of the viewport
3. THE System SHALL display page content in the main content area
4. THE Navbar SHALL display the title "SiteOS Enterprise"
5. THE Navbar SHALL display the current date
6. THE Navbar SHALL display a notification icon
7. THE Navbar SHALL display a user avatar with dropdown menu
8. THE User dropdown SHALL include Profile, Switch Role, and Logout options
9. WHEN viewport width is below tablet breakpoint, THE System SHALL collapse the Sidebar

### Requirement 7: Dashboard Page

**User Story:** As a user, I want an overview dashboard with key metrics, so that I can quickly assess system status

#### Acceptance Criteria

1. THE Dashboard SHALL display a Bento_Grid layout
2. THE Dashboard SHALL display four KPI_Cards showing Total Projects, Active Workers, Low Stock Items, and Total Budget
3. THE Dashboard SHALL display a Recharts bar chart comparing Project Budget versus Actual Expenses
4. THE Dashboard SHALL display a list of recent tasks with task name, project name, and status Badge
5. THE Dashboard SHALL be accessible to all roles

### Requirement 8: Project Management Page

**User Story:** As a Project_Manager, I want to view and create projects, so that I can manage construction initiatives

#### Acceptance Criteria

1. THE Projects page SHALL display a data table of all Projects
2. THE Projects table SHALL include columns for Project Name, Location, Type, Start Date, Budget, and Status
3. THE Projects page SHALL include a search bar for filtering projects
4. THE Projects page SHALL include a filter dropdown
5. THE Projects page SHALL include a "New Project" button
6. WHEN the "New Project" button is clicked, THE System SHALL display a Modal with a form
7. THE Project form SHALL include fields for Project Name, Location, Project Type, Start Date, End Date, and Budget
8. WHEN the Project form is submitted, THE System SHALL call the addProject function from Context_Provider
9. THE Projects page SHALL be accessible to Admin, Project_Manager, and Site_Engineer roles only

### Requirement 9: Task Management Page

**User Story:** As a Site_Engineer, I want to manage tasks with a kanban board, so that I can track work progress visually

#### Acceptance Criteria

1. THE Tasks page SHALL display a kanban board with three columns: Open, In Progress, and Completed
2. THE Tasks page SHALL display task cards that are draggable between columns
3. EACH task card SHALL display task name, project name, and assigned user name
4. WHEN a task card is moved to a different column, THE System SHALL call updateTaskStatus from Context_Provider
5. THE Tasks page SHALL be accessible to Project_Manager and Site_Engineer roles only

### Requirement 10: Workforce Management Page

**User Story:** As a Site_Engineer, I want to manage worker attendance, so that I can track labor availability

#### Acceptance Criteria

1. THE Workforce page SHALL display a table of all Workers
2. THE Workers table SHALL include columns for Name, Skill, Contact, Rate Type, and Base Rate
3. EACH worker row SHALL include attendance control buttons for Present, Half Day, and Absent
4. WHEN an attendance button is clicked, THE System SHALL call updateWorkerAttendance from Context_Provider
5. THE Workforce page SHALL be accessible to Admin and Site_Engineer roles only

### Requirement 11: Inventory Management Page

**User Story:** As a Storekeeper, I want to monitor material stock levels, so that I can prevent shortages

#### Acceptance Criteria

1. THE Inventory page SHALL display a table of all Inventory_Items
2. THE Inventory table SHALL include columns for Item Name, Category, Unit Cost, Current Stock, and Min Stock
3. WHEN an Inventory_Item has current_stock less than min_stock_qty, THE System SHALL highlight the row
4. WHEN an Inventory_Item has current_stock less than min_stock_qty, THE System SHALL display a warning icon
5. WHEN an Inventory_Item has current_stock less than min_stock_qty, THE System SHALL display a "Reorder" button
6. THE Inventory page SHALL be accessible to Admin, Project_Manager, and Storekeeper roles only

### Requirement 12: Finance Analytics Page

**User Story:** As an Admin, I want to view financial analytics, so that I can monitor project budgets and costs

#### Acceptance Criteria

1. THE Finance page SHALL display a Recharts pie chart showing distribution of Labor Costs versus Material Costs
2. THE Finance page SHALL display a table with one row per Project
3. THE Finance table SHALL include columns for Project, Budget, Total Cost, and Remaining Budget
4. THE Finance page SHALL calculate Total Cost by summing all Finance_Records for each Project
5. THE Finance page SHALL calculate Remaining Budget as Budget minus Total Cost
6. THE Finance page SHALL be accessible to Admin and Project_Manager roles only

### Requirement 13: Reusable UI Components

**User Story:** As a developer, I want consistent reusable components, so that the UI is uniform and maintainable

#### Acceptance Criteria

1. THE System SHALL provide a Button component with variants for primary, secondary, and danger styles
2. THE System SHALL provide an Input component with label and error state support
3. THE System SHALL provide a Select component with label and options array
4. THE System SHALL provide a Card component with consistent padding and styling
5. THE System SHALL provide a Badge component with color variants for status, success, warning, and danger
6. THE System SHALL provide a Modal component with overlay, close button, and content area
7. THE System SHALL provide a Table component with header and body rendering
8. ALL UI components SHALL follow the design system color palette and spacing standards

### Requirement 14: Responsive Design

**User Story:** As a user, I want the application to work on all devices, so that I can access it from desktop, tablet, or mobile

#### Acceptance Criteria

1. THE System SHALL display optimally on desktop viewports (1024px and above)
2. THE System SHALL display optimally on tablet viewports (768px to 1023px)
3. THE System SHALL display optimally on mobile viewports (below 768px)
4. WHEN viewport width is below 768px, THE System SHALL collapse the Sidebar into a hamburger menu
5. WHEN viewport width is below 768px, THE System SHALL stack Bento_Grid cards vertically
6. WHEN viewport width is below 768px, THE System SHALL make tables horizontally scrollable

### Requirement 15: Code Quality Standards

**User Story:** As a developer, I want clean professional code, so that the application is maintainable and production-ready

#### Acceptance Criteria

1. THE System SHALL include correct ES6 module imports for all dependencies
2. THE System SHALL include JSX syntax that is valid and executable
3. THE System SHALL include comments explaining architectural decisions
4. THE System SHALL NOT include placeholder UI or "TODO" comments in production code
5. THE System SHALL follow React best practices for component composition
6. THE System SHALL follow Tailwind CSS utility-first styling patterns
7. THE System SHALL include proper prop validation where appropriate

### Requirement 16: Chart Visualization

**User Story:** As a user, I want visual charts for data analysis, so that I can understand trends and distributions quickly

#### Acceptance Criteria

1. THE Dashboard SHALL display a bar chart using Recharts BarChart component
2. THE Dashboard bar chart SHALL compare Budget versus Actual Expenses for each Project
3. THE Finance page SHALL display a pie chart using Recharts PieChart component
4. THE Finance pie chart SHALL show the distribution of Labor Costs versus Material Costs
5. ALL charts SHALL use colors consistent with the design system
6. ALL charts SHALL include axis labels and legends where appropriate
7. ALL charts SHALL be responsive and resize with viewport changes

### Requirement 17: Navigation and Routing

**User Story:** As a user, I want seamless navigation between pages, so that I can access different features efficiently

#### Acceptance Criteria

1. THE System SHALL use React Router v6 for client-side routing
2. THE System SHALL define routes for Dashboard, Projects, Tasks, Workforce, Inventory, and Finance pages
3. THE Sidebar SHALL highlight the active route
4. WHEN a navigation link is clicked, THE System SHALL navigate without page reload
5. WHEN a User navigates to the root path, THE System SHALL display the Dashboard page
6. THE System SHALL maintain navigation state during route transitions

### Requirement 18: State Management

**User Story:** As a developer, I want centralized state management, so that data flows predictably through the application

#### Acceptance Criteria

1. THE System SHALL use React Context API for global state management
2. THE Context_Provider SHALL wrap the entire application component tree
3. THE Context_Provider SHALL expose state and functions via useContext hook
4. WHEN state is updated in Context_Provider, THE System SHALL re-render dependent components
5. THE System SHALL NOT use prop drilling for global state
6. THE System SHALL use local component state for UI-only state like modal visibility

### Requirement 19: Form Handling

**User Story:** As a user, I want intuitive forms for data entry, so that I can create and update records easily

#### Acceptance Criteria

1. THE Project creation Modal SHALL include form validation
2. WHEN a required form field is empty, THE System SHALL display an error message
3. WHEN a form is submitted successfully, THE System SHALL close the Modal
4. WHEN a form is submitted successfully, THE System SHALL update the Context_Provider state
5. WHEN a form is submitted successfully, THE System SHALL display the new record in the relevant table
6. THE System SHALL clear form fields after successful submission

### Requirement 20: Interactive Feedback

**User Story:** As a user, I want visual feedback for my actions, so that I know the system is responding

#### Acceptance Criteria

1. WHEN a User hovers over a button, THE System SHALL display a hover state with color change
2. WHEN a User clicks a button, THE System SHALL display a visual click effect
3. WHEN a User drags a task card, THE System SHALL display a dragging visual state
4. WHEN a User updates data, THE System SHALL reflect the change immediately in the UI
5. THE System SHALL use smooth CSS transitions for state changes
6. THE System SHALL provide visual indicators for loading states where appropriate
