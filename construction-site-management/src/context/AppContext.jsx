/**
 * AppContext
 * Global state and frontend-only business logic for SiteOS Enterprise SaaS simulation
 */

import { createContext, useState, useCallback, useMemo } from 'react';
import {
  mockUsers,
  mockProjects,
  mockTasks,
  mockWorkers,
  mockInventory,
  mockFinance,
  mockVendors,
  mockPurchaseOrders,
  mockMaterialIssues,
  mockWorkerAssignments,
  mockAttendance,
  mockProjectMembers,
  mockNotifications,
  mockLeaveApplications,
} from '../data/mockData';

export const AppContext = createContext();

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const sameDay = (dateA, dateB) => {
  return new Date(dateA).toISOString().slice(0, 10) === new Date(dateB).toISOString().slice(0, 10);
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [users] = useState(mockUsers);
  const [projects, setProjects] = useState(mockProjects);
  const [tasks, setTasks] = useState(mockTasks);
  const [workers, setWorkers] = useState(mockWorkers);
  const [inventory, setInventory] = useState(mockInventory);
  const [financeRecords, setFinanceRecords] = useState(mockFinance);

  const [vendors, setVendors] = useState(mockVendors);
  const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders);
  const [materialIssues, setMaterialIssues] = useState(mockMaterialIssues);
  const [workerAssignments, setWorkerAssignments] = useState(mockWorkerAssignments);
  const [attendanceRecords, setAttendanceRecords] = useState(mockAttendance);
  const [projectMembers, setProjectMembers] = useState(mockProjectMembers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [leaveApplications, setLeaveApplications] = useState(mockLeaveApplications);

  const pushNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: makeId('note'),
        read: false,
        createdAt: new Date().toISOString(),
        severity: 'medium',
        ...notification,
      },
      ...prev,
    ]);
  }, []);

  // Authentication actions
  const login = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  const switchRole = useCallback((newRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role: newRole });
    }
  }, [currentUser]);

  // Project actions
  const addProject = useCallback((project) => {
    const newProject = {
      id: makeId('proj'),
      ...project,
      status: project.status || 'Planning',
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProject = useCallback((id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Task actions
  const addTask = useCallback((task) => {
    const newTask = {
      id: makeId('task'),
      ...task,
      status: task.status || 'Open',
      priority: task.priority || 'Medium',
      workers_assigned: task.workers_assigned || [],
      materials_used: task.materials_used || [],
      deadline: task.deadline || task.due_date,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const checkDependencies = useCallback((taskId, tasksList = null) => {
    const currentTasks = tasksList || tasks;
    const task = currentTasks.find((t) => t.id === taskId);
    if (!task || !task.dependencies || task.dependencies.length === 0) {
      return true;
    }
    return task.dependencies.every((depId) => {
      const depTask = currentTasks.find((t) => t.id === depId);
      return depTask && depTask.status === 'Completed';
    });
  }, [tasks]);

  const updateTaskStatus = useCallback((id, status, skipValidation = false) => {
    if (status === 'In Progress' && !skipValidation) {
      const depsOk = checkDependencies(id);
      if (!depsOk) {
        pushNotification({
          type: 'error',
          title: 'Blocked Task',
          message: 'Cannot start: incomplete dependencies',
        });
        return false;
      }
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    return true;
  }, [checkDependencies, pushNotification]);

  const addTaskDependency = useCallback((taskId, depId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.dependencies?.includes(depId)) {
          return { ...t, dependencies: [...(t.dependencies || []), depId] };
        }
        return t;
      })
    );
  }, []);

  const removeTaskDependency = useCallback((taskId, depId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dependencies: (t.dependencies || []).filter(d => d !== depId) } : t))
    );
  }, []);

  const updateTaskProgress = useCallback((taskId, progress) => {
    const p = Math.max(0, Math.min(100, Math.round(progress)));
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, progress: p } : t)));
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
  }, []);

  // Vendor management
  const addVendor = useCallback((vendor) => {
    const newVendor = { id: makeId('vendor'), ...vendor, rating: Number(vendor.rating || 0) };
    setVendors((prev) => [...prev, newVendor]);
    return newVendor;
  }, []);

  const updateVendor = useCallback((vendorId, updates) => {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)));
  }, []);

  const deleteVendor = useCallback((vendorId) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
  }, []);

  // Finance helper
  const addFinanceRecord = useCallback((record) => {
    const newRecord = {
      id: makeId('fin'),
      payment_status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
      source: 'automation',
      ...record,
    };
    setFinanceRecords((prev) => [...prev, newRecord]);
    return newRecord;
  }, []);

  // Procurement
  const createPurchaseOrder = useCallback((payload, actorId) => {
    const po = {
      id: makeId('po'),
      ...payload,
      quantity: Number(payload.quantity),
      unit_price: Number(payload.unit_price),
      createdAt: new Date().toISOString().slice(0, 10),
      delivery_status: payload.delivery_status || 'ordered',
      created_by: actorId,
    };

    setPurchaseOrders((prev) => [...prev, po]);

    addFinanceRecord({
      projectId: po.projectId,
      cost_category: 'Material',
      amount: po.quantity * po.unit_price,
      description: `PO ${po.id} created for ${po.quantity} units`,
    });

    pushNotification({
      type: 'procurement_delivery',
      severity: 'medium',
      title: `PO created: ${po.id}`,
      message: `Purchase order for project ${po.projectId} has been created.`,
    });

    if (po.delivery_status === 'delivered') {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === po.itemId
            ? { ...item, current_stock: item.current_stock + po.quantity }
            : item
        )
      );
    }

    return po;
  }, [addFinanceRecord, pushNotification]);

  const updatePurchaseDeliveryStatus = useCallback((poId, status) => {
    setPurchaseOrders((prev) => {
      const target = prev.find((po) => po.id === poId);
      if (!target) {
        return prev;
      }

      const wasDelivered = target.delivery_status === 'delivered';
      const nowDelivered = status === 'delivered';

      if (!wasDelivered && nowDelivered) {
        setInventory((inventoryPrev) =>
          inventoryPrev.map((item) =>
            item.id === target.itemId
              ? { ...item, current_stock: item.current_stock + target.quantity }
              : item
          )
        );

        pushNotification({
          type: 'procurement_delivery',
          severity: 'low',
          title: `PO delivered: ${target.id}`,
          message: `Delivery received for purchase order ${target.id}.`,
        });
      }

      return prev.map((po) =>
        po.id === poId
          ? {
              ...po,
              delivery_status: status,
              deliveredAt: nowDelivered ? new Date().toISOString().slice(0, 10) : po.deliveredAt,
            }
          : po
      );
    });
  }, [pushNotification]);

  // Material issue and inventory workflow
  const issueMaterial = useCallback((payload, actorId) => {
    const { itemId, quantity, projectId, taskId } = payload;
    const qty = Number(quantity);

    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, current_stock: Math.max(0, item.current_stock - qty) }
          : item
      )
    );

    const issue = {
      id: makeId('mi'),
      itemId,
      projectId,
      taskId,
      quantity: qty,
      issued_by: actorId,
      issuedAt: new Date().toISOString().slice(0, 10),
    };
    setMaterialIssues((prev) => [...prev, issue]);

    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      addFinanceRecord({
        projectId,
        cost_category: 'Material',
        amount: qty * item.unit_cost,
        description: `Material issue ${item.item_name} (${qty} ${item.uom})`,
      });
    }

    if (taskId) {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const existing = Array.isArray(task.materials_used) ? task.materials_used : [];
          return {
            ...task,
            materials_used: [...existing, { itemId, quantity: qty }],
          };
        })
      );
    }

    return issue;
  }, [addFinanceRecord, inventory]);

  const addProcurement = useCallback((itemId, quantity, cost) => {
    const item = inventory.find((inv) => inv.id === itemId);
    if (!item) {
      return;
    }

    createPurchaseOrder(
      {
        projectId: projects[0]?.id,
        vendorId: vendors[0]?.id,
        itemId,
        quantity,
        unit_price: cost || item.unit_cost,
        delivery_status: 'delivered',
      },
      currentUser?.id || 'system'
    );
  }, [createPurchaseOrder, currentUser?.id, inventory, projects, vendors]);

  // Worker assignment and attendance
  const assignWorkerToTask = useCallback((payload) => {
    const assignment = {
      id: makeId('wa'),
      ...payload,
    };

    setWorkerAssignments((prev) => [...prev, assignment]);

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== payload.taskId) {
          return task;
        }

        const existing = Array.isArray(task.workers_assigned) ? task.workers_assigned : [];
        const workersAssigned = existing.includes(payload.workerId)
          ? existing
          : [...existing, payload.workerId];

        return { ...task, workers_assigned: workersAssigned };
      })
    );

    return assignment;
  }, []);

  const calculateLaborCost = useCallback((worker, status, hoursWorked) => {
    if (!worker || status === 'Absent') {
      return 0;
    }

    if (worker.rate_type === 'Hourly') {
      return worker.base_rate * Number(hoursWorked || 0);
    }

    if (status === 'Half Day') {
      return worker.base_rate * 0.5;
    }

    return worker.base_rate;
  }, []);

  const recordAttendance = useCallback((payload, actorId) => {
    const worker = workers.find((w) => w.id === payload.workerId);
    const laborCost = calculateLaborCost(worker, payload.status, payload.hours_worked);

    const attendance = {
      id: makeId('att'),
      ...payload,
      labor_cost: laborCost,
      recorded_by: actorId,
    };

    setAttendanceRecords((prev) => {
      const exists = prev.find((entry) =>
        entry.workerId === payload.workerId && sameDay(entry.date, payload.date)
      );

      if (exists) {
        return prev.map((entry) =>
          entry.id === exists.id
            ? { ...entry, ...attendance, id: exists.id }
            : entry
        );
      }

      return [...prev, attendance];
    });

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== payload.workerId) {
          return w;
        }

        const exists = (w.attendance || []).find((entry) => sameDay(entry.date, payload.date));
        const nextAttendance = exists
          ? w.attendance.map((entry) =>
              sameDay(entry.date, payload.date)
                ? { date: payload.date, status: payload.status, hours_worked: payload.hours_worked }
                : entry
            )
          : [...(w.attendance || []), { date: payload.date, status: payload.status, hours_worked: payload.hours_worked }];

        return { ...w, attendance: nextAttendance };
      })
    );

    if (laborCost > 0) {
      addFinanceRecord({
        projectId: payload.projectId,
        cost_category: 'Labor',
        amount: laborCost,
        description: `Attendance labor cost for ${worker?.name || payload.workerId}`,
      });
    }

    if (payload.status === 'Absent') {
      pushNotification({
        type: 'worker_absence',
        severity: 'high',
        title: 'Worker absence logged',
        message: `${worker?.name || 'Worker'} marked absent on ${payload.date}.`,
      });
    }

    return attendance;
  }, [addFinanceRecord, calculateLaborCost, pushNotification, workers]);

  const updateWorkerAttendance = useCallback((workerId, status, date) => {
    const worker = workers.find((w) => w.id === workerId);
    const defaultHours = status === 'Present' ? 8 : status === 'Half Day' ? 4 : 0;
    const projectId = projects[0]?.id;

    recordAttendance(
      {
        workerId,
        status,
        date,
        hours_worked: defaultHours,
        projectId,
      },
      currentUser?.id || 'system'
    );

    return worker;
  }, [currentUser?.id, projects, recordAttendance, workers]);

  // Project team management
  const assignProjectMember = useCallback((payload) => {
    const alreadyAssigned = projectMembers.some(
      (pm) => pm.projectId === payload.projectId && pm.userId === payload.userId
    );

    if (alreadyAssigned) {
      return null;
    }

    const member = {
      id: makeId('pm'),
      ...payload,
    };

    setProjectMembers((prev) => [...prev, member]);
    return member;
  }, [projectMembers]);

  const removeProjectMember = useCallback((memberId) => {
    setProjectMembers((prev) => prev.filter((member) => member.id !== memberId));
  }, []);

  // Worker management
  const addWorker = useCallback((worker) => {
    const newWorker = { id: makeId('worker'), attendance: [], salary: 0, ...worker };
    setWorkers((prev) => [...prev, newWorker]);
    return newWorker;
  }, []);

  const updateWorker = useCallback((workerId, updates) => {
    setWorkers((prev) => prev.map((w) => (w.id === workerId ? { ...w, ...updates } : w)));
  }, []);

  const deleteWorker = useCallback((workerId) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
  }, []);

  // Inventory stock actions
  const addInventoryItem = useCallback((item) => {
    const newItem = { id: makeId('inv'), current_stock: 0, min_stock_qty: 0, ...item };
    setInventory((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const addInventoryStock = useCallback((itemId, quantity) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, current_stock: item.current_stock + Number(quantity) } : item
      )
    );
  }, []);

  // Leave application actions
  const applyLeave = useCallback((payload) => {
    const application = {
      id: makeId('leave'),
      status: 'Pending',
      applied_at: new Date().toISOString().slice(0, 10),
      reviewed_by: null,
      reviewed_at: null,
      ...payload,
    };
    setLeaveApplications((prev) => [...prev, application]);
    return application;
  }, []);

  const approveLeave = useCallback((leaveId, reviewerId) => {
    setLeaveApplications((prev) =>
      prev.map((leave) =>
        leave.id === leaveId
          ? { ...leave, status: 'Approved', reviewed_by: reviewerId, reviewed_at: new Date().toISOString().slice(0, 10) }
          : leave
      )
    );
  }, []);

  const rejectLeave = useCallback((leaveId, reviewerId, rejection_reason = '') => {
    setLeaveApplications((prev) =>
      prev.map((leave) =>
        leave.id === leaveId
          ? { ...leave, status: 'Rejected', reviewed_by: reviewerId, reviewed_at: new Date().toISOString().slice(0, 10), rejection_reason }
          : leave
      )
    );
  }, []);

  // Salary calculation helper
  const calculateSalary = useCallback((workerId, fromDate, toDate) => {
    const records = attendanceRecords.filter((entry) => {
      if (entry.workerId !== workerId) return false;
      if (fromDate && entry.date < fromDate) return false;
      if (toDate && entry.date > toDate) return false;
      return true;
    });

    const totalDaysWorked = records.filter((r) => r.status === 'Present').length;
    const halfDays = records.filter((r) => r.status === 'Half Day').length;
    const totalHours = records.reduce((sum, r) => sum + Number(r.hours_worked || 0), 0);
    const totalSalary = records.reduce((sum, r) => sum + Number(r.labor_cost || 0), 0);
    const absentDays = records.filter((r) => r.status === 'Absent').length;

    const worker = workers.find((w) => w.id === workerId);
    const absenceDeduction = worker
      ? absentDays * (worker.rate_type === 'Daily' ? worker.base_rate : worker.base_rate * 8)
      : 0;

    return {
      totalDaysWorked,
      halfDays,
      totalHours,
      totalSalary,
      absentDays,
      absenceDeduction,
      netSalary: totalSalary - absenceDeduction,
    };
  }, [attendanceRecords, workers]);

  // Notification actions
  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => prev.map((note) => (note.id === id ? { ...note, read: true } : note)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));
  }, []);

  const systemNotifications = useMemo(() => {
    const lowStock = inventory
      .filter((item) => item.current_stock < item.min_stock_qty)
      .map((item) => ({
        id: `sys-low-stock-${item.id}`,
        type: 'low_stock',
        severity: 'high',
        title: `Low stock: ${item.item_name}`,
        message: `${item.current_stock} ${item.uom} left (min ${item.min_stock_qty}).`,
        createdAt: new Date().toISOString(),
        read: false,
      }));

    const overdue = tasks
      .filter((task) => task.status !== 'Completed' && new Date(task.deadline || task.due_date) < new Date())
      .map((task) => ({
        id: `sys-overdue-${task.id}`,
        type: 'overdue_tasks',
        severity: 'high',
        title: `Overdue task: ${task.task_name}`,
        message: `Task deadline ${task.deadline || task.due_date} has passed.`,
        createdAt: new Date().toISOString(),
        read: false,
      }));

    const budgetExceed = projects
      .filter((project) => {
        const spent = financeRecords
          .filter((record) => record.projectId === project.id)
          .reduce((sum, record) => sum + record.amount, 0);
        return spent > project.budget;
      })
      .map((project) => ({
        id: `sys-budget-${project.id}`,
        type: 'budget_exceed',
        severity: 'high',
        title: `Budget exceeded: ${project.project_name}`,
        message: `Project spending has exceeded planned budget.`,
        createdAt: new Date().toISOString(),
        read: false,
      }));

    return [...lowStock, ...overdue, ...budgetExceed];
  }, [financeRecords, inventory, projects, tasks]);

  const allNotifications = useMemo(() => {
    const map = new Map();
    [...notifications, ...systemNotifications].forEach((note) => {
      if (!map.has(note.id)) {
        map.set(note.id, note);
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, systemNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return allNotifications.filter((note) => !note.read).length;
  }, [allNotifications]);

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    switchRole,

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
    notifications: allNotifications,
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
