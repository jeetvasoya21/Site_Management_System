import connectDB from '../db/connection.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Worker from '../models/worker.model.js';
import WorkerAssignment from '../models/workerAssignment.model.js';
import Item from '../models/item.model.js';
import Vendor from '../models/vendor.model.js';
import PurchaseOrder from '../models/purchaseOrder.model.js';
import Attendance from '../models/attendance.model.js';
import MaterialIssue from '../models/materialIssue.model.js';
import Finance from '../models/finance.model.js';
import Notification from '../models/notification.model.js';
import LeaveApplication from '../models/leaveApplication.model.js';
import { syncAttendanceFinance, syncMaterialIssueFinance, syncProcurementFinance } from '../services/financeAutomation.service.js';

const PASSWORD = 'SiteOS123';

const resetDatabase = async () => {
  await Promise.all([
    LeaveApplication.deleteMany({}),
    Notification.deleteMany({}),
    Finance.deleteMany({}),
    MaterialIssue.deleteMany({}),
    Attendance.deleteMany({}),
    WorkerAssignment.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    Task.deleteMany({}),
    Worker.deleteMany({}),
    Item.deleteMany({}),
    Vendor.deleteMany({}),
    Project.deleteMany({}),
    User.deleteMany({}),
  ]);
};

const seed = async () => {
  await connectDB();
  await resetDatabase();

  const [admin, manager, engineer, storekeeper] = await User.create([
    { name: 'Aditi Admin', email: 'admin@siteos.local', password: PASSWORD, role: 'Admin', verified: true },
    { name: 'Manav Manager', email: 'manager@siteos.local', password: PASSWORD, role: 'Project_Manager', verified: true },
    { name: 'Esha Engineer', email: 'engineer@siteos.local', password: PASSWORD, role: 'Site_Engineer', verified: true },
    { name: 'Kabir Storekeeper', email: 'storekeeper@siteos.local', password: PASSWORD, role: 'Storekeeper', verified: true },
  ]);

  const projects = await Project.create([
    {
      projectName: 'Skyline Tower',
      siteLocation: 'Ahmedabad',
      projectType: 'Commercial',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-12-31'),
      budget: 25000000,
      status: 'Active',
      createdBy: manager._id,
      members: [
        { userId: manager._id, memberRole: 'Project_Manager', fromDate: new Date('2026-01-10') },
        { userId: engineer._id, memberRole: 'Site_Engineer', fromDate: new Date('2026-01-12') },
        { userId: storekeeper._id, memberRole: 'Storekeeper', fromDate: new Date('2026-01-15') },
      ],
    },
    {
      projectName: 'Riverfront Residency',
      siteLocation: 'Vadodara',
      projectType: 'Residential',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2027-03-15'),
      budget: 18000000,
      status: 'Planning',
      createdBy: manager._id,
      members: [
        { userId: manager._id, memberRole: 'Project_Manager', fromDate: new Date('2026-02-01') },
        { userId: engineer._id, memberRole: 'Site_Engineer', fromDate: new Date('2026-02-03') },
      ],
    },
    {
      projectName: 'Metro Link Depot',
      siteLocation: 'Surat',
      projectType: 'Infrastructure',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2027-08-20'),
      budget: 32000000,
      status: 'Active',
      createdBy: admin._id,
      members: [
        { userId: manager._id, memberRole: 'Project_Manager', fromDate: new Date('2026-03-01') },
        { userId: storekeeper._id, memberRole: 'Storekeeper', fromDate: new Date('2026-03-02') },
      ],
    },
  ]);

  const workers = await Worker.create([
    { name: 'Ravi Mason', skillType: 'Mason', contact: '9000000001', rateType: 'Daily', baseRate: 900, projectIds: [projects[0]._id] },
    { name: 'Neha Carpenter', skillType: 'Carpenter', contact: '9000000002', rateType: 'Daily', baseRate: 950, projectIds: [projects[0]._id, projects[1]._id] },
    { name: 'Aman Electrician', skillType: 'Electrician', contact: '9000000003', rateType: 'Hourly', baseRate: 180, projectIds: [projects[0]._id] },
    { name: 'Priya Plumber', skillType: 'Plumber', contact: '9000000004', rateType: 'Daily', baseRate: 850, projectIds: [projects[2]._id] },
    { name: 'Sahil Painter', skillType: 'Painter', contact: '9000000005', rateType: 'Daily', baseRate: 700, projectIds: [projects[1]._id] },
    { name: 'Ira Welder', skillType: 'Welder', contact: '9000000006', rateType: 'Hourly', baseRate: 220, projectIds: [projects[2]._id] },
  ]);

  const items = await Item.create([
    { itemName: 'Cement Bag', category: 'Construction', uom: 'bag', unitCost: 420, minStockQty: 50, currentStock: 180, supplier: 'BuildSupply Co.' },
    { itemName: 'Steel Rod', category: 'Structural', uom: 'unit', unitCost: 780, minStockQty: 30, currentStock: 75, supplier: 'MetalWorks Ltd.' },
    { itemName: 'Electrical Wire', category: 'Electrical', uom: 'roll', unitCost: 1200, minStockQty: 10, currentStock: 24, supplier: 'Electra Trade' },
    { itemName: 'Paint Drum', category: 'Finishing', uom: 'drum', unitCost: 2600, minStockQty: 8, currentStock: 12, supplier: 'ColorMax' },
  ]);

  const vendors = await Vendor.create([
    { vendorName: 'BuildSupply Co.', contact: '9100000001', email: 'sales@buildsupply.local', address: 'Ahmedabad', rating: 4.5 },
    { vendorName: 'MetalWorks Ltd.', contact: '9100000002', email: 'ops@metalworks.local', address: 'Vadodara', rating: 4.2 },
    { vendorName: 'Electra Trade', contact: '9100000003', email: 'support@electra.local', address: 'Surat', rating: 4.0 },
  ]);

  const tasks = await Task.create([
    {
      taskName: 'Foundation Layout',
      projectId: projects[0]._id,
      assignedTo: engineer._id,
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date('2026-04-20'),
      deadline: new Date('2026-04-22'),
      progress: 45,
    },
    {
      taskName: 'Electrical Trunking',
      projectId: projects[0]._id,
      assignedTo: engineer._id,
      status: 'Open',
      priority: 'Medium',
      dueDate: new Date('2026-05-05'),
      deadline: new Date('2026-05-08'),
      progress: 0,
    },
    {
      taskName: 'Steel Reinforcement',
      projectId: projects[2]._id,
      assignedTo: manager._id,
      status: 'In Progress',
      priority: 'Critical',
      dueDate: new Date('2026-04-18'),
      deadline: new Date('2026-04-19'),
      progress: 60,
    },
  ]);

  const assignments = await WorkerAssignment.create([
    { workerId: workers[0]._id, taskId: tasks[0]._id, fromDate: new Date('2026-04-01'), toDate: new Date('2026-04-10') },
    { workerId: workers[2]._id, taskId: tasks[1]._id, fromDate: new Date('2026-04-02'), toDate: new Date('2026-04-12') },
    { workerId: workers[5]._id, taskId: tasks[2]._id, fromDate: new Date('2026-04-03'), toDate: new Date('2026-04-15') },
  ]);

  await Promise.all([
    Task.findByIdAndUpdate(tasks[0]._id, { $addToSet: { workersAssigned: workers[0]._id } }),
    Task.findByIdAndUpdate(tasks[1]._id, { $addToSet: { workersAssigned: workers[2]._id } }),
    Task.findByIdAndUpdate(tasks[2]._id, { $addToSet: { workersAssigned: workers[5]._id } }),
  ]);

  const attendanceEntries = await Attendance.create([
    {
      projectId: projects[0]._id,
      workerId: workers[0]._id,
      date: new Date('2026-04-06'),
      status: 'Present',
      hoursWorked: 8,
      usedRateType: workers[0].rateType,
      usedRate: workers[0].baseRate,
      laborCost: workers[0].baseRate,
      recordedBy: engineer._id,
    },
    {
      projectId: projects[0]._id,
      workerId: workers[2]._id,
      date: new Date('2026-04-06'),
      status: 'Present',
      hoursWorked: 6,
      usedRateType: workers[2].rateType,
      usedRate: workers[2].baseRate,
      laborCost: workers[2].baseRate * 6,
      recordedBy: engineer._id,
    },
    {
      projectId: projects[2]._id,
      workerId: workers[5]._id,
      date: new Date('2026-04-06'),
      status: 'Half Day',
      hoursWorked: 4,
      usedRateType: workers[5].rateType,
      usedRate: workers[5].baseRate,
      laborCost: workers[5].baseRate * 4,
      recordedBy: manager._id,
    },
  ]);

  for (const attendance of attendanceEntries) {
    const worker = workers.find((entry) => String(entry._id) === String(attendance.workerId));
    await syncAttendanceFinance({ attendance, worker });
  }

  const purchaseOrders = await PurchaseOrder.create([
    {
      projectId: projects[0]._id,
      vendorId: vendors[0]._id,
      itemId: items[0]._id,
      quantity: 40,
      unitPrice: 415,
      deliveryStatus: 'delivered',
      expectedDelivery: new Date('2026-04-09'),
      deliveredAt: new Date('2026-04-09'),
      createdBy: storekeeper._id,
    },
    {
      projectId: projects[2]._id,
      vendorId: vendors[1]._id,
      itemId: items[1]._id,
      quantity: 20,
      unitPrice: 770,
      deliveryStatus: 'ordered',
      expectedDelivery: new Date('2026-04-12'),
      createdBy: storekeeper._id,
    },
  ]);

  await Item.findByIdAndUpdate(items[0]._id, { $inc: { currentStock: 40 } });
  for (const po of purchaseOrders) {
    await syncProcurementFinance({ purchaseOrder: po });
  }

  const refreshedItems = await Item.find({});
  const cementItem = refreshedItems.find((entry) => entry.itemName === 'Cement Bag');
  const steelItem = refreshedItems.find((entry) => entry.itemName === 'Steel Rod');

  const materialIssues = await MaterialIssue.create([
    {
      projectId: projects[0]._id,
      taskId: tasks[0]._id,
      itemId: cementItem._id,
      quantity: 15,
      issuedBy: storekeeper._id,
      issuedAt: new Date('2026-04-10'),
      remarks: 'Foundation work batch 1',
    },
    {
      projectId: projects[2]._id,
      taskId: tasks[2]._id,
      itemId: steelItem._id,
      quantity: 10,
      issuedBy: storekeeper._id,
      issuedAt: new Date('2026-04-11'),
      remarks: 'Reinforcement staging',
    },
  ]);

  await Item.findByIdAndUpdate(cementItem._id, { $inc: { currentStock: -15 } });
  await Item.findByIdAndUpdate(steelItem._id, { $inc: { currentStock: -10 } });

  for (const issue of materialIssues) {
    const item = refreshedItems.find((entry) => String(entry._id) === String(issue.itemId));
    await syncMaterialIssueFinance({ materialIssue: issue, item });
  }

  await Finance.create({
    projectId: projects[1]._id,
    costCategory: 'Overhead',
    amount: 25000,
    description: 'Temporary site office setup',
    paymentStatus: 'Paid',
    source: 'manual',
    notes: 'Seeded manual finance record',
  });

  console.log('Seed completed successfully.');
  console.log('');
  console.log('Credentials');
  console.log(`- Admin: admin@siteos.local / ${PASSWORD}`);
  console.log(`- Project Manager: manager@siteos.local / ${PASSWORD}`);
  console.log(`- Site Engineer: engineer@siteos.local / ${PASSWORD}`);
  console.log(`- Storekeeper: storekeeper@siteos.local / ${PASSWORD}`);
  console.log('');
  console.log('Project IDs');
  for (const project of projects) {
    console.log(`- ${project.projectName}: ${project._id}`);
  }
  console.log('');
  console.log('Task IDs');
  for (const task of tasks) {
    console.log(`- ${task.taskName}: ${task._id}`);
  }
  console.log('');
  console.log(`Workers seeded: ${workers.length}`);
  console.log(`Inventory items seeded: ${items.length}`);
  console.log(`Vendors seeded: ${vendors.length}`);
  console.log(`Assignments seeded: ${assignments.length}`);

  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
