/**
 * AppContext
 * Global state with real API integration for SiteOS Enterprise
 * Maintains the same interface as the original mock-data version
 */

import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  projectService,
  taskService,
  workerService,
  inventoryService,
  vendorService,
  procurementService,
  materialIssueService,
  attendanceService,
  workerAssignmentService,
  financeService,
  leaveService,
  notificationService,
} from '../services/apiServices';
import { useAuthStore } from '../store/authStore';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [financeRecords, setFinanceRecords] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [materialIssues, setMaterialIssues] = useState([]);
  const [workerAssignments, setWorkerAssignments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);

  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Helper to normalize API data (MongoDB _id → id)
  const normalize = (item) => {
    if (!item) return item;
    if (Array.isArray(item)) return item.map(normalize);
    const obj = { ...item };
    if (obj._id && !obj.id) obj.id = obj._id;
    return obj;
  };

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    if (!isAuthenticated) return;

    setDataLoading(true);
    setDataError(null);
    try {
      const [
        projectsRes,
        tasksRes,
        workersRes,
        inventoryRes,
        vendorsRes,
        procurementRes,
        materialIssuesRes,
        assignmentsRes,
        attendanceRes,
        financeRes,
        leavesRes,
        notificationsRes,
      ] = await Promise.allSettled([
        projectService.getAll(),
        taskService.getAll(),
        workerService.getAll(),
        inventoryService.getAll(),
        vendorService.getAll(),
        procurementService.getAll(),
        materialIssueService.getAll(),
        workerAssignmentService.getAll(),
        attendanceService.getAll(),
        financeService.getAll(),
        leaveService.getAll(),
        notificationService.getAll(),
      ]);

      if (projectsRes.status === 'fulfilled') setProjects(normalize(projectsRes.value.data || []));
      if (tasksRes.status === 'fulfilled') setTasks(normalize(tasksRes.value.data || []));
      if (workersRes.status === 'fulfilled') setWorkers(normalize(workersRes.value.data || []));
      if (inventoryRes.status === 'fulfilled') setInventory(normalize(inventoryRes.value.data || []));
      if (vendorsRes.status === 'fulfilled') setVendors(normalize(vendorsRes.value.data || []));
      if (procurementRes.status === 'fulfilled') setPurchaseOrders(normalize(procurementRes.value.data || []));
      if (materialIssuesRes.status === 'fulfilled') setMaterialIssues(normalize(materialIssuesRes.value.data || []));
      if (assignmentsRes.status === 'fulfilled') setWorkerAssignments(normalize(assignmentsRes.value.data || []));
      if (attendanceRes.status === 'fulfilled') setAttendanceRecords(normalize(attendanceRes.value.data || []));
      if (financeRes.status === 'fulfilled') setFinanceRecords(normalize(financeRes.value.data || []));
      if (leavesRes.status === 'fulfilled') setLeaveApplications(normalize(leavesRes.value.data || []));
      if (notificationsRes.status === 'fulfilled') setNotifications(normalize(notificationsRes.value.data || []));

      // Extract project members from projects
      if (projectsRes.status === 'fulfilled') {
        const members = [];
        (projectsRes.value.data || []).forEach(p => {
          (p.members || []).forEach(m => {
            members.push({ id: m._id, projectId: p._id, userId: m.userId?._id || m.userId, project_role: m.memberRole, ...m });
          });
        });
        setProjectMembers(normalize(members));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setDataError('Failed to load data');
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  // Auto-fetch data when token exists
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [fetchAllData, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;

    setProjects([]);
    setTasks([]);
    setWorkers([]);
    setInventory([]);
    setFinanceRecords([]);
    setVendors([]);
    setPurchaseOrders([]);
    setMaterialIssues([]);
    setWorkerAssignments([]);
    setAttendanceRecords([]);
    setProjectMembers([]);
    setNotifications([]);
    setLeaveApplications([]);
  }, [isAuthenticated]);

  const pushNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: `local-${Date.now()}`, read: false, createdAt: new Date().toISOString(), severity: 'medium', ...notification },
      ...prev,
    ]);
  }, []);

  // Authentication actions (kept for AppContext backward compatibility)
  const login = useCallback((userId) => {
    return userId;
  }, []);

  const logout = useCallback(() => {
    return true;
  }, []);

  const switchRole = useCallback((newRole) => {
    return newRole;
  }, [currentUser]);

  // ─── Project Actions ────────────────────────────────
  const addProject = useCallback(async (project) => {
    try {
      const res = await projectService.create({
        projectName: project.project_name || project.projectName,
        siteLocation: project.site_location || project.siteLocation,
        projectType: project.project_type || project.projectType || 'Commercial',
        startDate: project.start_date || project.startDate,
        endDate: project.end_date || project.endDate,
        budget: Number(project.budget),
        status: project.status || 'Planning',
      });
      const newProject = normalize(res.data);
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    } catch (err) {
      console.error('Error adding project:', err);
      pushNotification({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to add project' });
      return null;
    }
  }, [pushNotification]);

  const updateProject = useCallback(async (id, updates) => {
    try {
      const payload = {};
      if (updates.project_name || updates.projectName) payload.projectName = updates.project_name || updates.projectName;
      if (updates.site_location || updates.siteLocation) payload.siteLocation = updates.site_location || updates.siteLocation;
      if (updates.project_type || updates.projectType) payload.projectType = updates.project_type || updates.projectType;
      if (updates.start_date || updates.startDate) payload.startDate = updates.start_date || updates.startDate;
      if (updates.end_date || updates.endDate) payload.endDate = updates.end_date || updates.endDate;
      if (updates.budget !== undefined) payload.budget = Number(updates.budget);
      if (updates.status) payload.status = updates.status;

      const res = await projectService.update(id, payload);
      setProjects((prev) => prev.map((p) => (p.id === id || p._id === id ? normalize(res.data) : p)));
    } catch (err) {
      console.error('Error updating project:', err);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectService.remove(id);
      setProjects((prev) => prev.filter((p) => p.id !== id && p._id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  }, []);

  // ─── Task Actions ────────────────────────────────────
  const addTask = useCallback(async (task) => {
    try {
      const res = await taskService.create({
        taskName: task.task_name || task.taskName,
        projectId: task.projectId,
        assignedTo: task.assigned_to || task.assignedTo,
        status: task.status || 'Open',
        priority: task.priority || 'Medium',
        dueDate: task.due_date || task.dueDate,
        deadline: task.deadline || task.due_date || task.dueDate,
        workersAssigned: task.workers_assigned || task.workersAssigned || [],
        dependencies: task.dependencies || [],
      });
      const newTask = normalize(res.data);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      return null;
    }
  }, []);

  const checkDependencies = useCallback((taskId) => {
    const task = tasks.find((t) => (t.id || t._id) === taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every((dep) => {
      const depId = dep._id || dep.id || dep;
      const depTask = tasks.find((t) => (t.id || t._id) === depId);
      return depTask && depTask.status === 'Completed';
    });
  }, [tasks]);

  const updateTaskStatus = useCallback(async (id, status, skipValidation = false) => {
    if (status === 'In Progress' && !skipValidation) {
      if (!checkDependencies(id)) {
        pushNotification({ type: 'error', title: 'Blocked Task', message: 'Cannot start: incomplete dependencies' });
        return false;
      }
    }
    try {
      const res = await taskService.updateStatus(id, status);
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === id ? normalize(res.data) : t)));
      return true;
    } catch (err) {
      console.error('Error updating task status:', err);
      pushNotification({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to update task status' });
      return false;
    }
  }, [checkDependencies, pushNotification]);

  const addTaskDependency = useCallback(async (taskId, depId) => {
    const task = tasks.find(t => (t.id || t._id) === taskId);
    if (!task) return;
    const deps = [...(task.dependencies || []), depId];
    try {
      const res = await taskService.update(taskId, { dependencies: deps });
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? normalize(res.data) : t)));
    } catch (err) { console.error('Error adding dependency:', err); }
  }, [tasks]);

  const removeTaskDependency = useCallback(async (taskId, depId) => {
    const task = tasks.find(t => (t.id || t._id) === taskId);
    if (!task) return;
    const deps = (task.dependencies || []).filter(d => (d._id || d.id || d) !== depId);
    try {
      const res = await taskService.update(taskId, { dependencies: deps });
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? normalize(res.data) : t)));
    } catch (err) { console.error('Error removing dependency:', err); }
  }, [tasks]);

  const updateTaskProgress = useCallback(async (taskId, progress) => {
    try {
      const res = await taskService.updateProgress(taskId, progress);
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? normalize(res.data) : t)));
    } catch (err) { console.error('Error updating progress:', err); }
  }, []);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const res = await taskService.update(taskId, updates);
      setTasks((prev) => prev.map((t) => ((t.id || t._id) === taskId ? normalize(res.data) : t)));
    } catch (err) { console.error('Error updating task:', err); }
  }, []);

  // ─── Vendor Actions ──────────────────────────────────
  const addVendor = useCallback(async (vendor) => {
    try {
      const res = await vendorService.create({
        vendorName: vendor.vendor_name || vendor.vendorName,
        contact: vendor.contact,
        email: vendor.email,
        address: vendor.address,
        rating: Number(vendor.rating || 0),
      });
      const v = normalize(res.data);
      setVendors((prev) => [...prev, v]);
      return v;
    } catch (err) { console.error('Error adding vendor:', err); return null; }
  }, []);

  const updateVendor = useCallback(async (vendorId, updates) => {
    try {
      const res = await vendorService.update(vendorId, updates);
      setVendors((prev) => prev.map((v) => ((v.id || v._id) === vendorId ? normalize(res.data) : v)));
    } catch (err) { console.error('Error updating vendor:', err); }
  }, []);

  const deleteVendor = useCallback(async (vendorId) => {
    try {
      await vendorService.remove(vendorId);
      setVendors((prev) => prev.filter((v) => (v.id || v._id) !== vendorId));
    } catch (err) { console.error('Error deleting vendor:', err); }
  }, []);

  // ─── Finance ─────────────────────────────────────────
  const addFinanceRecord = useCallback(async (record) => {
    try {
      const res = await financeService.create({
        projectId: record.projectId,
        costCategory: record.cost_category || record.costCategory || 'Other',
        amount: Number(record.amount),
        description: record.description,
        paymentStatus: record.payment_status || record.paymentStatus || 'Pending',
        date: record.date || new Date().toISOString().slice(0, 10),
        source: record.source || 'manual',
      });
      const newRec = normalize(res.data);
      setFinanceRecords((prev) => [...prev, newRec]);
      return newRec;
    } catch (err) { console.error('Error adding finance record:', err); return null; }
  }, []);

  // ─── Procurement ─────────────────────────────────────
  const createPurchaseOrder = useCallback(async (payload, actorId) => {
    try {
      const res = await procurementService.create({
        projectId: payload.projectId,
        vendorId: payload.vendorId,
        itemId: payload.itemId,
        quantity: Number(payload.quantity),
        unitPrice: Number(payload.unit_price || payload.unitPrice),
        deliveryStatus: payload.delivery_status || payload.deliveryStatus || 'ordered',
        expectedDelivery: payload.expectedDelivery,
      });
      const po = normalize(res.data);
      setPurchaseOrders((prev) => [...prev, po]);
      // Refresh inventory if delivered
      if (po.deliveryStatus === 'delivered') {
        const invRes = await inventoryService.getAll();
        setInventory(normalize(invRes.data || []));
      }
      return po;
    } catch (err) { console.error('Error creating PO:', err); return null; }
  }, []);

  const updatePurchaseDeliveryStatus = useCallback(async (poId, status) => {
    try {
      const res = await procurementService.updateDeliveryStatus(poId, status);
      setPurchaseOrders((prev) => prev.map((po) => ((po.id || po._id) === poId ? normalize(res.data) : po)));
      if (status === 'delivered') {
        const invRes = await inventoryService.getAll();
        setInventory(normalize(invRes.data || []));
      }
    } catch (err) { console.error('Error updating delivery status:', err); }
  }, []);

  // ─── Material Issue ──────────────────────────────────
  const issueMaterial = useCallback(async (payload, actorId) => {
    try {
      const res = await materialIssueService.create({
        itemId: payload.itemId,
        quantity: Number(payload.quantity),
        projectId: payload.projectId,
        taskId: payload.taskId,
      });
      const issue = normalize(res.data);
      setMaterialIssues((prev) => [...prev, issue]);
      // Refresh inventory and finance
      const invRes = await inventoryService.getAll();
      setInventory(normalize(invRes.data || []));
      const finRes = await financeService.getAll();
      setFinanceRecords(normalize(finRes.data || []));
      return issue;
    } catch (err) {
      console.error('Error issuing material:', err);
      pushNotification({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to issue material' });
      return null;
    }
  }, [pushNotification]);

  const addProcurement = useCallback(async (itemId, quantity, cost) => {
    const item = inventory.find((inv) => (inv.id || inv._id) === itemId);
    if (!item) return;
    await createPurchaseOrder({
      projectId: projects[0]?._id || projects[0]?.id,
      vendorId: vendors[0]?._id || vendors[0]?.id,
      itemId,
      quantity,
      unitPrice: cost || item.unitCost || item.unit_cost,
      deliveryStatus: 'delivered',
    });
  }, [createPurchaseOrder, inventory, projects, vendors]);

  // ─── Worker Actions ──────────────────────────────────
  const assignWorkerToTask = useCallback(async (payload) => {
    try {
      const res = await workerAssignmentService.create({
        workerId: payload.workerId,
        taskId: payload.taskId,
        fromDate: payload.from_date || payload.fromDate || new Date().toISOString().slice(0, 10),
        toDate: payload.to_date || payload.toDate || new Date().toISOString().slice(0, 10),
      });
      const assignment = normalize(res.data);
      setWorkerAssignments((prev) => [...prev, assignment]);
      // Refresh tasks to get updated workersAssigned
      const tasksRes = await taskService.getAll();
      setTasks(normalize(tasksRes.data || []));
      return assignment;
    } catch (err) { console.error('Error assigning worker:', err); return null; }
  }, []);

  const recordAttendance = useCallback(async (payload, actorId) => {
    try {
      const res = await attendanceService.record({
        workerId: payload.workerId,
        projectId: payload.projectId,
        date: payload.date,
        status: payload.status,
        hoursWorked: payload.hours_worked || payload.hoursWorked || 0,
      });
      const att = normalize(res.data);
      setAttendanceRecords((prev) => {
        const exists = prev.find(e => (e.id || e._id) === (att.id || att._id));
        if (exists) return prev.map(e => ((e.id || e._id) === (att.id || att._id) ? att : e));
        return [...prev, att];
      });
      // Refresh finance
      const finRes = await financeService.getAll();
      setFinanceRecords(normalize(finRes.data || []));
      return att;
    } catch (err) { console.error('Error recording attendance:', err); return null; }
  }, []);

  const updateWorkerAttendance = useCallback(async (workerId, status, date) => {
    const defaultHours = status === 'Present' ? 8 : status === 'Half Day' ? 4 : 0;
    const projectId = projects[0]?._id || projects[0]?.id;
    return recordAttendance({ workerId, status, date, hoursWorked: defaultHours, projectId });
  }, [projects, recordAttendance]);

  const calculateLaborCost = useCallback((worker, status, hoursWorked) => {
    if (!worker || status === 'Absent') return 0;
    const rate = worker.baseRate || worker.base_rate || 0;
    const rateType = worker.rateType || worker.rate_type;
    if (rateType === 'Hourly') return rate * Number(hoursWorked || 0);
    if (status === 'Half Day') return rate * 0.5;
    return rate;
  }, []);

  // ─── Project Team ────────────────────────────────────
  const assignProjectMember = useCallback(async (payload) => {
    const alreadyAssigned = projectMembers.some(
      (pm) => pm.projectId === payload.projectId && pm.userId === payload.userId
    );
    if (alreadyAssigned) return null;
    try {
      const res = await projectService.addMember(payload.projectId, {
        userId: payload.userId,
        memberRole: payload.project_role || payload.memberRole || 'Site_Engineer',
      });
      // Refresh projects to get updated members
      const projRes = await projectService.getAll();
      setProjects(normalize(projRes.data || []));
      return normalize(res.data);
    } catch (err) { console.error('Error assigning member:', err); return null; }
  }, [projectMembers]);

  const removeProjectMember = useCallback(async (memberId) => {
    // Find which project this member belongs to
    const pm = projectMembers.find(m => (m.id || m._id) === memberId);
    if (pm) {
      try {
        await projectService.removeMember(pm.projectId, memberId);
        setProjectMembers((prev) => prev.filter((m) => (m.id || m._id) !== memberId));
      } catch (err) { console.error('Error removing member:', err); }
    }
  }, [projectMembers]);

  // ─── Worker CRUD ─────────────────────────────────────
  const addWorker = useCallback(async (worker) => {
    try {
      const res = await workerService.create({
        name: worker.name,
        skillType: worker.skill_type || worker.skillType,
        contact: worker.contact,
        rateType: worker.rate_type || worker.rateType || 'Daily',
        baseRate: Number(worker.base_rate || worker.baseRate),
        salary: Number(worker.salary || 0),
        projectIds: worker.projectId ? [worker.projectId] : [],
      });
      const w = normalize(res.data);
      setWorkers((prev) => [...prev, w]);
      return w;
    } catch (err) { console.error('Error adding worker:', err); return null; }
  }, []);

  const updateWorker = useCallback(async (workerId, updates) => {
    try {
      const res = await workerService.update(workerId, updates);
      setWorkers((prev) => prev.map((w) => ((w.id || w._id) === workerId ? normalize(res.data) : w)));
    } catch (err) { console.error('Error updating worker:', err); }
  }, []);

  const deleteWorker = useCallback(async (workerId) => {
    try {
      await workerService.remove(workerId);
      setWorkers((prev) => prev.filter((w) => (w.id || w._id) !== workerId));
    } catch (err) { console.error('Error deleting worker:', err); }
  }, []);

  // ─── Inventory ───────────────────────────────────────
  const addInventoryItem = useCallback(async (item) => {
    try {
      const res = await inventoryService.create({
        itemName: item.item_name || item.itemName,
        category: item.category,
        uom: item.uom,
        unitCost: Number(item.unit_cost || item.unitCost),
        minStockQty: Number(item.min_stock_qty || item.minStockQty || 0),
        currentStock: Number(item.current_stock || item.currentStock || 0),
        supplier: item.supplier || '',
      });
      const newItem = normalize(res.data);
      setInventory((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) { console.error('Error adding item:', err); return null; }
  }, []);

  const addInventoryStock = useCallback(async (itemId, quantity) => {
    try {
      const res = await inventoryService.addStock(itemId, Number(quantity));
      setInventory((prev) => prev.map((item) => ((item.id || item._id) === itemId ? normalize(res.data) : item)));
    } catch (err) { console.error('Error adding stock:', err); }
  }, []);

  // ─── Leave Applications ──────────────────────────────
  const applyLeave = useCallback(async (payload) => {
    try {
      const res = await leaveService.apply({
        workerId: payload.workerId,
        startDate: payload.start_date || payload.startDate,
        endDate: payload.end_date || payload.endDate,
        reason: payload.reason,
        leaveType: payload.leave_type || payload.leaveType || 'Personal',
      });
      const leave = normalize(res.data);
      setLeaveApplications((prev) => [...prev, leave]);
      return leave;
    } catch (err) { console.error('Error applying leave:', err); return null; }
  }, []);

  const approveLeave = useCallback(async (leaveId, reviewerId) => {
    try {
      const res = await leaveService.approve(leaveId);
      setLeaveApplications((prev) => prev.map((l) => ((l.id || l._id) === leaveId ? normalize(res.data) : l)));
    } catch (err) { console.error('Error approving leave:', err); }
  }, []);

  const rejectLeave = useCallback(async (leaveId, reviewerId, rejectionReason = '') => {
    try {
      const res = await leaveService.reject(leaveId, rejectionReason);
      setLeaveApplications((prev) => prev.map((l) => ((l.id || l._id) === leaveId ? normalize(res.data) : l)));
    } catch (err) { console.error('Error rejecting leave:', err); }
  }, []);

  // ─── Salary ──────────────────────────────────────────
  const calculateSalary = useCallback((workerId, fromDate, toDate) => {
    const records = attendanceRecords.filter((entry) => {
      if ((entry.workerId?._id || entry.workerId) !== workerId) return false;
      if (fromDate && entry.date < fromDate) return false;
      if (toDate && entry.date > toDate) return false;
      return true;
    });
    const totalDaysWorked = records.filter((r) => r.status === 'Present').length;
    const halfDays = records.filter((r) => r.status === 'Half Day').length;
    const totalHours = records.reduce((sum, r) => sum + Number(r.hoursWorked || r.hours_worked || 0), 0);
    const totalSalary = records.reduce((sum, r) => sum + Number(r.laborCost || r.labor_cost || 0), 0);
    const absentDays = records.filter((r) => r.status === 'Absent').length;
    return { totalDaysWorked, halfDays, totalHours, totalSalary, absentDays, absenceDeduction: 0, netSalary: totalSalary };
  }, [attendanceRecords]);

  // ─── Notifications ───────────────────────────────────
  const markNotificationRead = useCallback(async (id) => {
    try {
      if (String(id).startsWith('sys-') || String(id).startsWith('local-')) {
        setNotifications((prev) => prev.map((n) => ((n.id || n._id) === id ? { ...n, read: true } : n)));
        return;
      }
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => ((n.id || n._id) === id ? { ...n, read: true } : n)));
    } catch (err) { console.error('Error marking notification read:', err); }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) { console.error('Error marking all read:', err); }
  }, []);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Provide a users array (from workers' userId refs + current user) for backward compatibility
  const users = useMemo(() => {
    const userMap = new Map();
    workers.forEach(w => {
      if (w.userId && typeof w.userId === 'object') {
        userMap.set(w.userId._id || w.userId.id, { id: w.userId._id || w.userId.id, ...w.userId });
      }
    });
    return Array.from(userMap.values());
  }, [workers]);

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchRole,
    dataLoading,
    dataError,
    fetchAllData,

    users,
    projects,
    tasks,
    workers,
    inventory,
    financeRecords,
    vendors,
    purchaseOrders,
    materialIssues,
    workerAssignments,
    attendanceRecords,
    projectMembers,
    leaveApplications,
    notifications,
    unreadNotificationCount,

    addProject,
    updateProject,
    deleteProject,

    addTask,
    updateTask,
    updateTaskStatus,
    checkDependencies,
    addTaskDependency,
    removeTaskDependency,
    updateTaskProgress,

    addVendor,
    updateVendor,
    deleteVendor,

    createPurchaseOrder,
    updatePurchaseDeliveryStatus,

    issueMaterial,
    addProcurement,

    addWorker,
    updateWorker,
    deleteWorker,

    assignWorkerToTask,
    recordAttendance,
    updateWorkerAttendance,
    calculateLaborCost,

    addInventoryItem,
    addInventoryStock,

    assignProjectMember,
    removeProjectMember,

    applyLeave,
    approveLeave,
    rejectLeave,
    calculateSalary,

    addFinanceRecord,

    markNotificationRead,
    markAllNotificationsRead,
    pushNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
