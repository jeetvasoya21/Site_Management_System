const express = require('express');
const router = express.Router();

// Import controllers
const UserController = require('../controllers/UserController');
const ProjectController = require('../controllers/ProjectController');
const TaskController = require('../controllers/TaskController');
const WorkerController = require('../controllers/WorkerController');
const VendorController = require('../controllers/VendorController');
const ProcurementController = require('../controllers/ProcurementController');
const InventoryController = require('../controllers/InventoryController');
const MaterialIssueController = require('../controllers/MaterialIssueController');
const AttendanceController = require('../controllers/AttendanceController');
const FinanceController = require('../controllers/FinanceController');
const NotificationController = require('../controllers/NotificationController');
const ProjectMemberController = require('../controllers/ProjectMemberController');
const LeaveController = require('../controllers/LeaveController');
const WorkerAssignmentController = require('../controllers/WorkerAssignmentController');
const User = require('../models/User');

// Auth routes
const ALLOWED_ROLES = ['Admin', 'Project_Manager', 'Site_Engineer', 'Worker'];

router.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }

    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const newUser = await User.create({ name, email, password, role, phone });
    const { password: _, ...userData } = newUser;

    res.status(201).json({
      message: 'Account created successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.getByEmail(email);
    if (!user || user.role !== role || !User.verifyPassword(password, user.password)) {
      if (user && user.role !== role) {
        return res.status(401).json({ error: 'Invalid role for this user' });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userData } = user;
    res.json({
      message: 'Login successful',
      user: userData,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password Reset route — allows max 2 self-resets per user
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    // Check if user exists
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Check reset count (max 2 allowed)
    const resetCount = await User.getResetCount(email);
    if (resetCount >= 2) {
      return res.status(403).json({
        error: 'Password reset limit reached (2 resets allowed). Please contact the Admin to change your password.',
        limitReached: true,
      });
    }

    // Reset the password and increment count
    const updatedUser = await User.resetPassword(email, newPassword);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    await User.incrementResetCount(email);
    const newCount = (resetCount || 0) + 1;

    res.json({
      message: `Password reset successful! You have ${2 - newCount} reset(s) remaining.`,
      resetsRemaining: 2 - newCount,
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
router.get('/users', UserController.getAllUsers);
router.get('/users/:id', UserController.getUserById);
router.post('/users', UserController.createUser);
router.put('/users/:id', UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

// Project routes
router.get('/projects', ProjectController.getAllProjects);
router.get('/projects/:id', ProjectController.getProjectById);
router.post('/projects', ProjectController.createProject);
router.put('/projects/:id', ProjectController.updateProject);
router.delete('/projects/:id', ProjectController.deleteProject);

// Task routes
router.get('/tasks', TaskController.getAllTasks);
router.get('/tasks/:id', TaskController.getTaskById);
router.get('/projects/:projectId/tasks', TaskController.getTasksByProject);
router.post('/tasks', TaskController.createTask);
router.put('/tasks/:id', TaskController.updateTask);
router.delete('/tasks/:id', TaskController.deleteTask);

// Worker routes
router.get('/workers', WorkerController.getAllWorkers);
router.get('/workers/:id', WorkerController.getWorkerById);
router.post('/workers', WorkerController.createWorker);
router.put('/workers/:id', WorkerController.updateWorker);
router.delete('/workers/:id', WorkerController.deleteWorker);

// Vendor routes
router.get('/vendors', VendorController.getAllVendors);
router.get('/vendors/:id', VendorController.getVendorById);
router.post('/vendors', VendorController.createVendor);
router.put('/vendors/:id', VendorController.updateVendor);
router.delete('/vendors/:id', VendorController.deleteVendor);

// Procurement routes
router.get('/procurement', ProcurementController.getAllProcurements);
router.get('/procurement/:id', ProcurementController.getProcurementById);
router.get('/projects/:projectId/procurement', ProcurementController.getProcurementsByProject);
router.post('/procurement', ProcurementController.createProcurement);
router.put('/procurement/:id', ProcurementController.updateProcurement);
router.delete('/procurement/:id', ProcurementController.deleteProcurement);

// Inventory routes
router.get('/inventory', InventoryController.getAllItems);
router.get('/inventory/:id', InventoryController.getItemById);
router.post('/inventory', InventoryController.createItem);
router.put('/inventory/:id', InventoryController.updateItem);
router.delete('/inventory/:id', InventoryController.deleteItem);

// Material Issue routes
router.get('/material-issue', MaterialIssueController.getAllIssues);
router.get('/material-issue/:id', MaterialIssueController.getIssueById);
router.get('/projects/:projectId/material-issue', MaterialIssueController.getIssuesByProject);
router.post('/material-issue', MaterialIssueController.createIssue);
router.put('/material-issue/:id', MaterialIssueController.updateIssue);
router.delete('/material-issue/:id', MaterialIssueController.deleteIssue);

// Attendance routes
router.get('/attendance', AttendanceController.getAllAttendance);
router.get('/attendance/:id', AttendanceController.getAttendanceById);
router.get('/projects/:projectId/attendance', AttendanceController.getAttendanceByProject);
router.get('/workers/:workerId/attendance', AttendanceController.getAttendanceByWorker);
router.post('/attendance', AttendanceController.createAttendance);
router.put('/attendance/:id', AttendanceController.updateAttendance);
router.delete('/attendance/:id', AttendanceController.deleteAttendance);

// Finance routes
router.get('/finance', FinanceController.getAllFinance);
router.get('/finance/:id', FinanceController.getFinanceById);
router.get('/projects/:projectId/finance', FinanceController.getFinanceByProject);
router.post('/finance', FinanceController.createFinance);
router.put('/finance/:id', FinanceController.updateFinance);
router.delete('/finance/:id', FinanceController.deleteFinance);

// Notification routes
router.get('/notifications', NotificationController.getAllNotifications);
router.get('/notifications/user/:userId', NotificationController.getNotifications);
router.post('/notifications', NotificationController.createNotification);
router.put('/notifications/:id/read', NotificationController.markRead);
router.put('/notifications/read-all/:userId', NotificationController.markAllRead);
router.delete('/notifications/:id', NotificationController.deleteNotification);

// Project Member routes (Site Engineer assignment to projects)
router.get('/project-members', ProjectMemberController.getAllMembers);
router.get('/project-members/project/:projectId', ProjectMemberController.getMembersByProject);
router.post('/project-members', ProjectMemberController.createMember);
router.delete('/project-members/:id', ProjectMemberController.deleteMember);

// Leave routes
router.get('/leave', LeaveController.getAllLeaves);
router.get('/workers/:workerId/leave', LeaveController.getLeavesByWorker);
router.post('/leave', LeaveController.createLeave);
router.put('/leave/:id/approve', LeaveController.approveLeave);
router.put('/leave/:id/reject', LeaveController.rejectLeave);

// Worker Assignment routes
router.get('/worker-assignments', WorkerAssignmentController.getAllAssignments);
router.get('/worker-assignments/:id', WorkerAssignmentController.getAssignmentById);
router.get('/tasks/:taskId/assignments', WorkerAssignmentController.getAssignmentsByTask);
router.post('/worker-assignments', WorkerAssignmentController.createAssignment);
router.delete('/worker-assignments/:id', WorkerAssignmentController.deleteAssignment);

// Legacy routes for compatibility
router.get('/message', (req, res) => {
  res.json({ message: "Hello from backend" });
});

router.post('/data', (req, res) => {
  res.json({ status: "success" });
});

module.exports = router;