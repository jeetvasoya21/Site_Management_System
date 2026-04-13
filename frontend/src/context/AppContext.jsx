/**
 * AppContext
 * Global state for SiteOS Enterprise with backend API integration
 * ALL data comes from PostgreSQL via API — no mock data
 */

import { createContext, useState, useCallback, useEffect, useMemo } from 'react';

export const AppContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const makeId = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

// ── helpers to normalize DB rows → frontend shape ──
// IDs are always stored as numbers; URL params come in as strings.
// We stringify all IDs to make comparisons safe everywhere.
const sid = (v) => (v == null ? null : String(v));

const mapProject = (p) => ({
  id: sid(p.project_id ?? p.id),
  project_name: p.project_name,
  site_location: p.site_location,
  project_type: p.project_type,
  start_date: p.start_date,
  end_date: p.end_date,
  budget: Number(p.budget || 0),
  status: p.status || 'Active',
  created_by: sid(p.created_by),
});

const mapTask = (t) => ({
  id: sid(t.task_id ?? t.id),
  projectId: sid(t.project_id),
  task_name: t.task_name,
  assigned_to: sid(t.assigned_to),
  start_date: t.start_date,
  end_date: t.end_date,
  status: t.status || 'Open',
  priority: t.priority || 'Medium',
  due_date: t.due_date,
  deadline: t.deadline,
  progress: t.progress || 0,
  workers_assigned: t.workers_assigned || [],
  materials_used: t.materials_used || [],
  dependencies: t.dependencies || [],
});

const mapWorker = (w) => ({
  id: sid(w.worker_id ?? w.id),
  user_id: sid(w.user_id),
  project_id: sid(w.project_id),
  name: w.name,
  skill_type: w.skill_type,
  contact: w.contact,
  rate_type: w.rate_type,
  base_rate: Number(w.base_rate || 0),
  salary: Number(w.salary || 0),
  attendance: w.attendance || [],
});

const mapInventory = (i) => ({
  id: sid(i.item_id ?? i.id),
  item_name: i.item_name,
  category: i.category,
  uom: i.uom,
  unit_cost: Number(i.unit_cost || 0),
  min_stock_qty: Number(i.min_stock_qty || 0),
  current_stock: Number(i.current_stock || 0),
  supplier: i.supplier,
});

const mapVendor = (v) => ({
  id: sid(v.vendor_id ?? v.id),
  vendor_name: v.vendor_name,
  contact: v.contact,
  email: v.email,
  address: v.address,
  rating: Number(v.rating || 0),
});

const mapProcurement = (po) => ({
  id: sid(po.id),
  procurement_id: po.procurement_id,
  projectId: sid(po.project_id),
  vendorId: sid(po.vendor_id),
  itemId: sid(po.item_id),
  quantity: Number(po.quantity || 0),
  unit_price: Number(po.unit_price || 0),
  delivery_status: po.delivery_status,
  expected_delivery: po.expected_delivery,
  deliveredAt: po.delivered_at,
  created_by: sid(po.created_by),
});

const mapWorkerAssignment = (wa) => ({
  id: sid(wa.assignment_id ?? wa.id),
  workerId: sid(wa.worker_id),
  taskId: sid(wa.task_id),
  from_date: wa.from_date ? String(wa.from_date).slice(0, 10) : null,
  to_date: wa.to_date ? String(wa.to_date).slice(0, 10) : null,
});

const mapAttendance = (a) => ({
  id: sid(a.attendance_id ?? a.id),
  workerId: sid(a.worker_id),
  projectId: sid(a.project_id),
  date: a.date ? new Date(new Date(a.date).getTime() - new Date(a.date).getTimezoneOffset() * 60000).toISOString().split('T')[0] : null,
  status: a.status,
  hours_worked: Number(a.hours_worked || 0),
  labor_cost: Number(a.labor_cost || 0),
  recorded_by: sid(a.recorded_by),
});

const mapFinance = (f) => ({
  id: sid(f.finance_id ?? f.id),
  projectId: sid(f.project_id),
  cost_category: f.cost_category,
  amount: Number(f.amount || 0),
  date: f.date,
  description: f.description,
  payment_status: f.payment_status,
  source: f.source,
});

const mapMaterialIssue = (mi) => ({
  id: sid(mi.material_issue_id ?? mi.id),
  projectId: sid(mi.project_id),
  taskId: sid(mi.task_id),
  itemId: sid(mi.item_id),
  quantity: Number(mi.quantity || 0),
  issued_by: sid(mi.issued_by),
  issuedAt: mi.issued_at,
});

const mapLeave = (l) => ({
  id: sid(l.leave_id ?? l.id),
  workerId: sid(l.worker_id),
  start_date: l.start_date,
  end_date: l.end_date,
  reason: l.reason,
  status: l.status || 'Pending',
  applied_at: l.applied_on,
  reviewed_by: sid(l.reviewed_by),
  reviewed_at: l.reviewed_on,
});

const mapUser = (u) => ({
  id: sid(u.user_id ?? u.id),
  name: u.name,
  email: u.email,
  role: u.role,
  phone: u.phone,
  is_active: u.is_active,
});

const mapProjectMember = (pm) => ({
  id: sid(pm.project_member_id ?? pm.id),
  projectId: sid(pm.project_id),
  userId: sid(pm.user_id),
  project_role: pm.member_role || 'Site_Engineer',
  from_date: pm.from_date,
  to_date: pm.to_date,
});

const mapNotification = (n) => ({
  id: sid(n.id),
  user_id: sid(n.user_id),
  title: n.title || n.message,
  message: n.message,
  type: n.type || 'general',
  severity: n.severity || 'medium',
  read: n.is_read || false,
  createdAt: n.created_at,
});

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State for all data - initialized as empty arrays
  const [users, setUsers] = useState([]);
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
  const [dbNotifications, setDbNotifications] = useState([]);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    users: false, projects: false, tasks: false, workers: false,
    inventory: false, finance: false, vendors: false, procurement: false,
    materialIssues: false, attendance: false,
  });
  const [errors, setErrors] = useState({});

  // ── API FETCH FUNCTIONS ──

  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.map(mapUser));
      setErrors(prev => ({ ...prev, users: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, users: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data.map(mapProject));
      setErrors(prev => ({ ...prev, projects: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, projects: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.map(mapTask));
      setErrors(prev => ({ ...prev, tasks: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, tasks: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    setLoading(prev => ({ ...prev, workers: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/workers`);
      if (!res.ok) throw new Error('Failed to fetch workers');
      const data = await res.json();
      setWorkers(data.map(mapWorker));
      setErrors(prev => ({ ...prev, workers: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, workers: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, workers: false }));
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    setLoading(prev => ({ ...prev, inventory: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      setInventory(data.map(mapInventory));
      setErrors(prev => ({ ...prev, inventory: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, inventory: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  }, []);

  const fetchFinance = useCallback(async () => {
    setLoading(prev => ({ ...prev, finance: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/finance`);
      if (!res.ok) throw new Error('Failed to fetch finance');
      const data = await res.json();
      setFinanceRecords(data.map(mapFinance));
      setErrors(prev => ({ ...prev, finance: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, finance: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, finance: false }));
    }
  }, []);

  const fetchVendors = useCallback(async () => {
    setLoading(prev => ({ ...prev, vendors: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`);
      if (!res.ok) throw new Error('Failed to fetch vendors');
      const data = await res.json();
      setVendors(data.map(mapVendor));
      setErrors(prev => ({ ...prev, vendors: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, vendors: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, vendors: false }));
    }
  }, []);

  const fetchProcurement = useCallback(async () => {
    setLoading(prev => ({ ...prev, procurement: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/procurement`);
      if (!res.ok) throw new Error('Failed to fetch procurement');
      const data = await res.json();
      setPurchaseOrders(data.map(mapProcurement));
      setErrors(prev => ({ ...prev, procurement: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, procurement: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, procurement: false }));
    }
  }, []);

  const fetchMaterialIssues = useCallback(async () => {
    setLoading(prev => ({ ...prev, materialIssues: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/material-issue`);
      if (!res.ok) throw new Error('Failed to fetch material issues');
      const data = await res.json();
      setMaterialIssues(data.map(mapMaterialIssue));
      setErrors(prev => ({ ...prev, materialIssues: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, materialIssues: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, materialIssues: false }));
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoading(prev => ({ ...prev, attendance: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/attendance`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setAttendanceRecords(data.map(mapAttendance));
      setErrors(prev => ({ ...prev, attendance: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, attendance: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  }, []);

  // ── FETCH PROJECT MEMBERS (DB-backed) ──
  const fetchProjectMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/project-members`);
      if (!res.ok) throw new Error('Failed to fetch project members');
      const data = await res.json();
      setProjectMembers(data.map(mapProjectMember));
    } catch (error) {
      console.error('Error fetching project members:', error);
    }
  }, []);

  // ── FETCH NOTIFICATIONS (DB-backed) ──
  const fetchNotifications = useCallback(async (userId) => {
    try {
      const url = userId
        ? `${API_BASE_URL}/notifications/user/${userId}`
        : `${API_BASE_URL}/notifications`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setDbNotifications(data.map(mapNotification));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  // ── FETCH LEAVE APPLICATIONS (DB-backed) ──
  const fetchLeaveApplications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave`);
      if (!res.ok) throw new Error('Failed to fetch leave applications');
      const data = await res.json();
      setLeaveApplications(data.map(mapLeave));
    } catch (error) {
      console.error('Error fetching leave applications:', error);
    }
  }, []);

  const fetchWorkerAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/worker-assignments`);
      if (!res.ok) throw new Error('Failed to fetch worker assignments');
      const data = await res.json();
      setWorkerAssignments(data.map(mapWorkerAssignment));
    } catch (error) {
      console.error('Error fetching worker assignments:', error);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchTasks();
    fetchWorkers();
    fetchInventory();
    fetchFinance();
    fetchVendors();
    fetchProcurement();
    fetchMaterialIssues();
    fetchAttendance();
    fetchProjectMembers();
    fetchNotifications();
    fetchLeaveApplications();
    fetchWorkerAssignments();
  }, [fetchUsers, fetchProjects, fetchTasks, fetchWorkers, fetchInventory,
      fetchFinance, fetchVendors, fetchProcurement, fetchMaterialIssues,
      fetchAttendance, fetchProjectMembers, fetchNotifications, fetchLeaveApplications,
      fetchWorkerAssignments]);

  // ── NOTIFICATION SYSTEM ──
  const pushNotification = useCallback(async (notification) => {
    // Push to DB if we have a user connected, otherwise just local
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: notification.user_id || null,
          title: notification.title || notification.message,
          message: notification.message,
          type: notification.type || 'general',
          severity: notification.severity || 'medium',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDbNotifications(prev => [mapNotification(data), ...prev]);
        return;
      }
    } catch (e) {
      // Fallback to local
    }
    // Local fallback
    setLocalNotifications(prev => [{
      id: makeId('note'),
      read: false,
      createdAt: new Date().toISOString(),
      severity: 'medium',
      ...notification,
    }, ...prev]);
  }, []);

  // ── AUTH ──
  const login = useCallback((user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Reload notifications for this user
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [fetchNotifications]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setDbNotifications([]);
    setLocalNotifications([]);
  }, []);

  // ── PROJECT ACTIONS ──
  const addProject = useCallback(async (project) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create project');
      const mapped = mapProject(data);
      setProjects(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update project');
      const mapped = mapProject(data);
      setProjects(prev => prev.map(p => p.id === sid(id) ? mapped : p));
      return mapped;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      setProjects(prev => prev.filter(p => p.id !== sid(id)));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }, []);

  // ── TASK ACTIONS ──
  const addTask = useCallback(async (task) => {
    try {
      const apiData = {
        project_id: task.projectId || task.project_id,
        task_name: task.task_name,
        assigned_to: task.assigned_to,
        start_date: task.start_date,
        end_date: task.end_date,
        status: task.status || 'Open',
        priority: task.priority || 'Medium',
        deadline: task.deadline || task.due_date,
        workers_assigned: task.workers_assigned || [],
        materials_used: task.materials_used || [],
      };
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');
      const mapped = mapTask(data);
      setTasks(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, []);

  const checkDependencies = useCallback((taskId, tasksList = null) => {
    const currentTasks = tasksList || tasks;
    const task = currentTasks.find((t) => t.id === sid(taskId));
    if (!task || !task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every((depId) => {
      const depTask = currentTasks.find((t) => t.id === sid(depId));
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
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');
      setTasks(prev => prev.map(t => t.id === sid(id) ? mapTask(data) : t));
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    }
  }, [checkDependencies, pushNotification]);

  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');
      const mapped = mapTask(data);
      setTasks(prev => prev.map(t => t.id === sid(taskId) ? mapped : t));
      return mapped;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, []);

  const addTaskDependency = useCallback((taskId, depId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === sid(taskId) && !t.dependencies?.includes(sid(depId))) {
        return { ...t, dependencies: [...(t.dependencies || []), sid(depId)] };
      }
      return t;
    }));
  }, []);

  const removeTaskDependency = useCallback((taskId, depId) => {
    setTasks(prev => prev.map(t =>
      t.id === sid(taskId) ? { ...t, dependencies: (t.dependencies || []).filter(d => d !== sid(depId)) } : t
    ));
  }, []);

  const updateTaskProgress = useCallback((taskId, progress) => {
    const p = Math.max(0, Math.min(100, Math.round(progress)));
    setTasks(prev => prev.map(t => t.id === sid(taskId) ? { ...t, progress: p } : t));
  }, []);

  // ── VENDOR ACTIONS ──
  const addVendor = useCallback(async (vendor) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create vendor');
      const mapped = mapVendor(data);
      setVendors(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  }, []);

  const updateVendor = useCallback(async (vendorId, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update vendor');
      const mapped = mapVendor(data);
      setVendors(prev => prev.map(v => v.id === sid(vendorId) ? mapped : v));
      return mapped;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  }, []);

  const deleteVendor = useCallback(async (vendorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors/${vendorId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete vendor');
      setVendors(prev => prev.filter(v => v.id !== sid(vendorId)));
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }, []);

  // ── FINANCE (DB-driven) ──
  const addFinanceRecord = useCallback(async (record) => {
    try {
      const res = await fetch(`${API_BASE_URL}/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: record.projectId || record.project_id,
          cost_category: record.cost_category,
          amount: record.amount,
          description: record.description,
          payment_status: record.payment_status || 'Pending',
          date: record.date || new Date().toISOString().slice(0, 10),
          source: record.source || 'automation',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create finance record');
      const mapped = mapFinance(data);
      setFinanceRecords(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error adding finance record:', error);
      return null;
    }
  }, []);

  // ── PROCUREMENT (DB-driven) ──
  const createPurchaseOrder = useCallback(async (payload, actorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/procurement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: payload.projectId || payload.project_id,
          vendor_id: payload.vendorId || payload.vendor_id,
          item_id: payload.itemId || payload.item_id,
          quantity: Number(payload.quantity),
          unit_price: Number(payload.unit_price),
          delivery_status: payload.delivery_status || 'ordered',
          expected_delivery: payload.expectedDelivery || payload.expected_delivery,
          created_by: actorId && !isNaN(Number(actorId)) ? Number(actorId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create purchase order');
      const mapped = mapProcurement(data);
      setPurchaseOrders(prev => [...prev, mapped]);

      pushNotification({
        type: 'procurement_delivery',
        severity: 'medium',
        title: `PO created: ${mapped.procurement_id || mapped.id}`,
        message: `Purchase order created for project.`,
      });

      return mapped;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }, [pushNotification]);

  const updatePurchaseDeliveryStatus = useCallback(async (poId, status) => {
    try {
      const target = purchaseOrders.find(po => po.id === sid(poId) || po.procurement_id === String(poId));
      const body = { delivery_status: status };
      if (status === 'delivered') {
        body.delivered_at = new Date().toISOString().slice(0, 10);
      }

      const res = await fetch(`${API_BASE_URL}/procurement/${poId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update procurement status');

      const mapped = mapProcurement(data);
      setPurchaseOrders(prev => prev.map(po => po.id === sid(poId) ? mapped : po));

      // If marking as delivered — update inventory stock in DB
      if (status === 'delivered' && target && target.delivery_status !== 'delivered') {
        const invItem = inventory.find(i => i.id === target.itemId);
        if (invItem) {
          const newStock = Number(invItem.current_stock) + Number(target.quantity);
          try {
            const invRes = await fetch(`${API_BASE_URL}/inventory/${target.itemId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ current_stock: newStock }),
            });
            if (invRes.ok) {
              const invData = await invRes.json();
              setInventory(prev => prev.map(i =>
                i.id === target.itemId ? { ...i, current_stock: Number(invData.current_stock) } : i
              ));
            }
          } catch (e) {
            console.error('Error updating inventory after delivery:', e);
          }
        }
        pushNotification({
          type: 'procurement_delivery',
          severity: 'low',
          title: `PO delivered: ${target.procurement_id || target.id}`,
          message: `Delivery received. Inventory updated.`,
        });
      }

      return mapped;
    } catch (error) {
      console.error('Error updating procurement status:', error);
      throw error;
    }
  }, [purchaseOrders, inventory, pushNotification]);

  // ── MATERIAL ISSUE ──
  const issueMaterial = useCallback(async (payload, actorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/material-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: payload.projectId || payload.project_id,
          task_id: payload.taskId || payload.task_id,
          item_id: payload.itemId || payload.item_id,
          quantity: Number(payload.quantity),
          issued_by: actorId && !isNaN(Number(actorId)) ? Number(actorId) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue material');
      const mapped = mapMaterialIssue(data);
      setMaterialIssues(prev => [...prev, mapped]);

      // update inventory stock locally
      setInventory(prev => prev.map(item =>
        item.id === sid(payload.itemId || payload.item_id)
          ? { ...item, current_stock: Math.max(0, item.current_stock - Number(payload.quantity)) }
          : item
      ));

      return mapped;
    } catch (error) {
      console.error('Error issuing material:', error);
      throw error;
    }
  }, []);

  const addProcurement = useCallback((itemId, quantity, cost) => {
    const item = inventory.find(inv => inv.id === sid(itemId));
    if (!item) return;
    createPurchaseOrder({
      projectId: projects[0]?.id,
      vendorId: vendors[0]?.id,
      itemId,
      quantity,
      unit_price: cost || item.unit_cost,
      delivery_status: 'delivered',
    }, currentUser?.id || null);
  }, [createPurchaseOrder, currentUser?.id, inventory, projects, vendors]);

  // ── WORKER ACTIONS (DB-driven) ──
  const addWorker = useCallback(async (worker) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add worker');
      const mapped = mapWorker(data);
      setWorkers(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error adding worker:', error);
      throw error;
    }
  }, []);

  const updateWorker = useCallback(async (workerId, updates) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/${workerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update worker');
      const mapped = mapWorker(data);
      setWorkers(prev => prev.map(w => w.id === sid(workerId) ? mapped : w));
      return mapped;
    } catch (error) {
      console.error('Error updating worker:', error);
      throw error;
    }
  }, []);

  const deleteWorker = useCallback(async (workerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/${workerId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete worker');
      setWorkers(prev => prev.filter(w => w.id !== sid(workerId)));
      return true;
    } catch (error) {
      console.error('Error deleting worker:', error);
      throw error;
    }
  }, []);

  // ── WORKER ASSIGNMENT (DB-backed) ──
  const assignWorkerToTask = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/worker-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: payload.workerId,
          task_id: payload.taskId,
          from_date: payload.from_date,
          to_date: payload.to_date,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign worker');
      const mapped = mapWorkerAssignment(data);
      setWorkerAssignments(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error assigning worker to task:', error);
      throw error;
    }
  }, []);

  // ── ATTENDANCE (DB-driven per worker) ──
  const calculateLaborCost = useCallback((worker, status, hoursWorked) => {
    if (!worker || status === 'Absent') return 0;
    if (worker.rate_type?.toLowerCase() === 'hourly') return worker.base_rate * Number(hoursWorked || 0);
    if (status === 'Half Day') return worker.base_rate * 0.5;
    return worker.base_rate;
  }, []);

  const recordAttendance = useCallback(async (payload, actorId) => {
    const worker = workers.find(w => w.id === sid(payload.workerId));
    const laborCost = calculateLaborCost(worker, payload.status, payload.hours_worked);
    // Only pass recorded_by if it's a valid numeric user id
    const safeActorId = actorId && !isNaN(Number(actorId)) ? Number(actorId) : null;

    try {
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: payload.workerId,
          project_id: payload.projectId,
          date: payload.date,
          status: payload.status,
          hours_worked: Number(payload.hours_worked || 0),
          labor_cost: laborCost,
          recorded_by: safeActorId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record attendance');
      const mapped = mapAttendance(data);

      // Update attendance records safely
      setAttendanceRecords(prev => {
        const existIdx = prev.findIndex(e => e.workerId === mapped.workerId && e.date === mapped.date);
        if (existIdx >= 0) {
          const copy = [...prev];
          copy[existIdx] = mapped;
          return copy;
        }
        return [...prev, mapped];
      });

      // Update workers state safely directly calculating from current + new mapped
      setWorkers(workersPrev => {
        return workersPrev.map(w => {
          if (w.id === mapped.workerId) {
            // Find current records for this worker, removing old version of this date to add new one
            const otherRecords = attendanceRecords.filter(a => a.workerId === mapped.workerId && a.date !== mapped.date);
            const sumLaborCost = otherRecords.reduce((sum, a) => sum + Number(a.labor_cost || 0), 0) + Number(mapped.labor_cost || 0);
            return { ...w, salary: sumLaborCost };
          }
          return w;
        });
      });

      return mapped;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  }, [calculateLaborCost, workers]);

  const updateWorkerAttendance = useCallback((workerId, status, date) => {
    const worker = workers.find(w => w.id === sid(workerId));
    const defaultHours = status === 'Present' ? 8 : status === 'Half Day' ? 4 : 0;
    const projectId = worker?.project_id || projects[0]?.id;

    recordAttendance({
      workerId: sid(workerId),
      status,
      date,
      hours_worked: defaultHours,
      projectId: projectId || null,
    }, currentUser?.id || null);

    return worker;
  }, [currentUser?.id, projects, recordAttendance, workers]);

  // ── PROJECT TEAM — DB-backed ──
  const assignProjectMember = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/project-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: payload.projectId || payload.project_id,
          user_id: payload.userId || payload.user_id,
          member_role: payload.project_role || payload.member_role || 'Site_Engineer',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) return null; // already assigned
        throw new Error(data.error || 'Failed to assign project member');
      }
      const mapped = mapProjectMember(data);
      setProjectMembers(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error assigning project member:', error);
      throw error;
    }
  }, []);

  const removeProjectMember = useCallback(async (memberId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/project-members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove project member');
      setProjectMembers(prev => prev.filter(m => m.id !== sid(memberId)));
      return true;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }, []);

  // ── INVENTORY ──
  const addInventoryItem = useCallback(async (item) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add inventory item');
      const mapped = mapInventory(data);
      setInventory(prev => [...prev, mapped]);
      return mapped;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }, []);

  const addInventoryStock = useCallback(async (itemId, quantity) => {
    try {
      const item = inventory.find(inv => inv.id === sid(itemId));
      if (!item) throw new Error('Inventory item not found');
      const newStock = Number(item.current_stock) + Number(quantity);
      const res = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_stock: newStock }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update inventory stock');
      setInventory(prev => prev.map(inv =>
        inv.id === sid(itemId) ? { ...inv, current_stock: Number(data.current_stock) } : inv
      ));
      return data;
    } catch (error) {
      console.error('Error updating inventory stock:', error);
      throw error;
    }
  }, [inventory]);

  // ── LEAVE APPLICATIONS (DB-driven) ──
  const applyLeave = useCallback(async (payload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: payload.workerId,
          start_date: payload.start_date,
          end_date: payload.end_date,
          reason: payload.reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply leave');
      const mapped = mapLeave(data);
      setLeaveApplications(prev => [mapped, ...prev]);
      return mapped;
    } catch (error) {
      console.error('Error applying leave:', error);
      throw error;
    }
  }, []);

  const approveLeave = useCallback(async (leaveId, reviewerId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave/${leaveId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve leave');
      const mapped = mapLeave(data);
      setLeaveApplications(prev => prev.map(l => l.id === sid(leaveId) ? mapped : l));
      return mapped;
    } catch (error) {
      console.error('Error approving leave:', error);
      throw error;
    }
  }, []);

  const rejectLeave = useCallback(async (leaveId, reviewerId, rejection_reason = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/leave/${leaveId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId, reason: rejection_reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject leave');
      const mapped = mapLeave(data);
      setLeaveApplications(prev => prev.map(l => l.id === sid(leaveId) ? mapped : l));
      return mapped;
    } catch (error) {
      console.error('Error rejecting leave:', error);
      throw error;
    }
  }, []);

  // ── SALARY CALCULATOR ──
  const calculateSalary = useCallback((workerId, fromDate, toDate) => {
    const records = attendanceRecords.filter(entry => {
      if (entry.workerId !== sid(workerId)) return false;
      if (fromDate && entry.date < fromDate) return false;
      if (toDate && entry.date > toDate) return false;
      return true;
    });
    const totalDaysWorked = records.filter(r => r.status === 'Present').length;
    const halfDays = records.filter(r => r.status === 'Half Day' || r.status === 'Half_Day').length;
    const totalHours = records.reduce((sum, r) => sum + Number(r.hours_worked || 0), 0);
    const totalSalary = records.reduce((sum, r) => sum + Number(r.labor_cost || 0), 0);
    const absentDays = records.filter(r => r.status === 'Absent').length;
    const worker = workers.find(w => w.id === sid(workerId));
    const absenceDeduction = worker
      ? absentDays * (worker.rate_type?.toLowerCase() === 'daily' ? worker.base_rate : worker.base_rate * 8)
      : 0;
    return { totalDaysWorked, halfDays, totalHours, totalSalary, absentDays, absenceDeduction, netSalary: totalSalary - absenceDeduction };
  }, [attendanceRecords, workers]);

  // ── NOTIFICATION MANAGEMENT ──
  const [readSystemNotes, setReadSystemNotes] = useState(new Set());

  // ── SYSTEM NOTIFICATIONS (computed from live data) ──
  const systemNotifications = useMemo(() => {
    const lowStock = inventory
      .filter(item => item.current_stock < item.min_stock_qty)
      .map(item => ({
        id: `sys-low-stock-${item.id}`,
        type: 'low_stock',
        severity: 'high',
        title: `Low stock: ${item.item_name}`,
        message: `${item.current_stock} ${item.uom} left (min ${item.min_stock_qty}).`,
        createdAt: new Date().toISOString(),
        read: readSystemNotes.has(`sys-low-stock-${item.id}`),
      }));

    const overdue = tasks
      .filter(task => task.status !== 'Completed' && new Date(task.deadline || task.due_date) < new Date())
      .map(task => ({
        id: `sys-overdue-${task.id}`,
        type: 'overdue_tasks',
        severity: 'high',
        title: `Overdue task: ${task.task_name}`,
        message: `Task deadline ${task.deadline || task.due_date} has passed.`,
        createdAt: new Date().toISOString(),
        read: readSystemNotes.has(`sys-overdue-${task.id}`),
      }));

    const budgetExceed = projects
      .filter(project => {
        const spent = financeRecords
          .filter(r => r.projectId === project.id)
          .reduce((sum, r) => sum + r.amount, 0);
        return spent > project.budget;
      })
      .map(project => ({
        id: `sys-budget-${project.id}`,
        type: 'budget_exceed',
        severity: 'high',
        title: `Budget exceeded: ${project.project_name}`,
        message: `Project spending has exceeded planned budget.`,
        createdAt: new Date().toISOString(),
        read: readSystemNotes.has(`sys-budget-${project.id}`),
      }));

    return [...lowStock, ...overdue, ...budgetExceed];
  }, [financeRecords, inventory, projects, tasks, readSystemNotes]);

  const allNotifications = useMemo(() => {
    const map = new Map();
    [...dbNotifications, ...localNotifications, ...systemNotifications].forEach(note => {
      if (!map.has(note.id)) map.set(note.id, note);
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [dbNotifications, localNotifications, systemNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return allNotifications.filter(note => !note.read).length;
  }, [allNotifications]);

  const markNotificationRead = useCallback(async (id) => {
    if (String(id).startsWith('sys-')) {
      setReadSystemNotes(prev => new Set([...prev, id]));
      return;
    }
    try {
      // Try DB mark-read first
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setDbNotifications(prev => prev.map(note => note.id === sid(id) ? { ...note, read: true } : note));
        return;
      }
    } catch (e) { /* ignore */ }
    // Fallback: local
    setLocalNotifications(prev => prev.map(note => note.id === sid(id) ? { ...note, read: true } : note));
  }, []);

  const markAllNotificationsRead = useCallback(async (userId) => {
    try {
      const uid = userId || currentUser?.id;
      if (uid) {
        await fetch(`${API_BASE_URL}/notifications/read-all/${uid}`, { method: 'PUT' });
      }
    } catch (e) { /* ignore */ }
    setDbNotifications(prev => prev.map(note => ({ ...note, read: true })));
    setLocalNotifications(prev => prev.map(note => ({ ...note, read: true })));
    // Mark system ones read too
    setReadSystemNotes(new Set(systemNotifications.map(n => n.id)));
  }, [currentUser?.id, systemNotifications]);


  const value = {
    currentUser, isAuthenticated, login, logout,
    users, projects, tasks, workers, inventory, financeRecords, vendors,
    purchaseOrders, materialIssues, workerAssignments, attendanceRecords,
    projectMembers, leaveApplications,
    notifications: allNotifications, unreadNotificationCount,

    addProject, updateProject, deleteProject,
    addTask, updateTask, updateTaskStatus, checkDependencies,
    addTaskDependency, removeTaskDependency, updateTaskProgress,
    addVendor, updateVendor, deleteVendor,
    createPurchaseOrder, updatePurchaseDeliveryStatus,
    issueMaterial, addProcurement,
    addWorker, updateWorker, deleteWorker,
    assignWorkerToTask, recordAttendance, updateWorkerAttendance,
    addInventoryItem, addInventoryStock,
    assignProjectMember, removeProjectMember,
    applyLeave, approveLeave, rejectLeave, calculateSalary,
    addFinanceRecord,
    markNotificationRead, markAllNotificationsRead, pushNotification,
    fetchNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
