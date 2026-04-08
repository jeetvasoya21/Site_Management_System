import api from "./api";

export const projectService = {
  getAll: (params) => api.get("/projects", { params }).then(r => r.data),
  getById: (id) => api.get(`/projects/${id}`).then(r => r.data),
  create: (data) => api.post("/projects", data).then(r => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then(r => r.data),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data).then(r => r.data),
  removeMember: (id, memberId) => api.delete(`/projects/${id}/members/${memberId}`).then(r => r.data),
};

export const taskService = {
  getAll: (params) => api.get("/tasks", { params }).then(r => r.data),
  getById: (id) => api.get(`/tasks/${id}`).then(r => r.data),
  create: (data) => api.post("/tasks", data).then(r => r.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }).then(r => r.data),
  updateProgress: (id, progress) => api.patch(`/tasks/${id}/progress`, { progress }).then(r => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
};

export const workerService = {
  getAll: (params) => api.get("/workers", { params }).then(r => r.data),
  getById: (id) => api.get(`/workers/${id}`).then(r => r.data),
  create: (data) => api.post("/workers", data).then(r => r.data),
  update: (id, data) => api.put(`/workers/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/workers/${id}`).then(r => r.data),
};

export const inventoryService = {
  getAll: (params) => api.get("/inventory", { params }).then(r => r.data),
  getById: (id) => api.get(`/inventory/${id}`).then(r => r.data),
  create: (data) => api.post("/inventory", data).then(r => r.data),
  update: (id, data) => api.put(`/inventory/${id}`, data).then(r => r.data),
  addStock: (id, quantity) => api.patch(`/inventory/${id}/add-stock`, { quantity }).then(r => r.data),
  remove: (id) => api.delete(`/inventory/${id}`).then(r => r.data),
};

export const vendorService = {
  getAll: (params) => api.get("/vendors", { params }).then(r => r.data),
  getById: (id) => api.get(`/vendors/${id}`).then(r => r.data),
  create: (data) => api.post("/vendors", data).then(r => r.data),
  update: (id, data) => api.put(`/vendors/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/vendors/${id}`).then(r => r.data),
};

export const procurementService = {
  getAll: (params) => api.get("/procurement", { params }).then(r => r.data),
  create: (data) => api.post("/procurement", data).then(r => r.data),
  updateDeliveryStatus: (id, deliveryStatus) => api.patch(`/procurement/${id}/delivery-status`, { deliveryStatus }).then(r => r.data),
  remove: (id) => api.delete(`/procurement/${id}`).then(r => r.data),
};

export const materialIssueService = {
  getAll: (params) => api.get("/material-issues", { params }).then(r => r.data),
  create: (data) => api.post("/material-issues", data).then(r => r.data),
};

export const attendanceService = {
  getAll: (params) => api.get("/attendance", { params }).then(r => r.data),
  record: (data) => api.post("/attendance", data).then(r => r.data),
  getSalary: (params) => api.get("/attendance/salary", { params }).then(r => r.data),
};

export const workerAssignmentService = {
  getAll: (params) => api.get("/worker-assignments", { params }).then(r => r.data),
  create: (data) => api.post("/worker-assignments", data).then(r => r.data),
  remove: (id) => api.delete(`/worker-assignments/${id}`).then(r => r.data),
};

export const financeService = {
  getAll: (params) => api.get("/finance", { params }).then(r => r.data),
  create: (data) => api.post("/finance", data).then(r => r.data),
  update: (id, data) => api.put(`/finance/${id}`, data).then(r => r.data),
  remove: (id) => api.delete(`/finance/${id}`).then(r => r.data),
  getProjectSummary: () => api.get("/finance/project-summary").then(r => r.data),
  getCategorySummary: (params) => api.get("/finance/category-summary", { params }).then(r => r.data),
};

export const leaveService = {
  getAll: (params) => api.get("/leaves", { params }).then(r => r.data),
  apply: (data) => api.post("/leaves", data).then(r => r.data),
  approve: (id) => api.patch(`/leaves/${id}/approve`).then(r => r.data),
  reject: (id, rejectionReason) => api.patch(`/leaves/${id}/reject`, { rejectionReason }).then(r => r.data),
};

export const notificationService = {
  getAll: () => api.get("/notifications").then(r => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then(r => r.data),
};

export const dashboardService = {
  getStats: () => api.get("/dashboard/stats").then(r => r.data),
};
