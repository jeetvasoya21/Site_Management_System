import Attendance from "../models/attendance.model.js";
import Worker from "../models/worker.model.js";
import Notification from "../models/notification.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { syncAttendanceFinance } from "../services/financeAutomation.service.js";

const calculateLaborCost = (worker, status, hoursWorked) => {
  if (!worker || status === "Absent") return 0;
  if (worker.rateType === "Hourly") return worker.baseRate * Number(hoursWorked || 0);
  if (status === "Half Day") return worker.baseRate * 0.5;
  return worker.baseRate;
};

export const getAll = asyncHandler(async (req, res) => {
  const { projectId, workerId, date } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (workerId) filter.workerId = workerId;
  if (date) filter.date = new Date(date);

  const records = await Attendance.find(filter)
    .populate("workerId", "name skillType rateType baseRate")
    .populate("projectId", "projectName")
    .populate("recordedBy", "name")
    .sort({ date: -1 });

  res.json({ success: true, data: records });
});

export const record = asyncHandler(async (req, res) => {
  const { workerId, projectId, date, status, hoursWorked } = req.body;
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  const laborCost = calculateLaborCost(worker, status, hoursWorked);
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOneAndUpdate(
    { workerId, projectId, date: dateObj },
    {
      workerId,
      projectId,
      date: dateObj,
      status,
      hoursWorked: Number(hoursWorked || 0),
      usedRateType: worker.rateType,
      usedRate: worker.baseRate,
      laborCost,
      recordedBy: req.user._id,
    },
    { upsert: true, new: true, runValidators: true }
  );

  await syncAttendanceFinance({ attendance, worker });

  if (status === "Absent") {
    await Notification.create({
      type: "worker_absence",
      severity: "high",
      title: "Worker absence logged",
      message: `${worker.name} marked absent on ${date}.`,
    });
  }

  const populated = await Attendance.findById(attendance._id)
    .populate("workerId", "name skillType rateType baseRate")
    .populate("projectId", "projectName");

  res.json({ success: true, data: populated });
});

export const getSalary = asyncHandler(async (req, res) => {
  const { workerId, fromDate, toDate } = req.query;
  const filter = { workerId };
  if (fromDate) filter.date = { ...filter.date, $gte: new Date(fromDate) };
  if (toDate) filter.date = { ...filter.date, $lte: new Date(toDate) };

  const records = await Attendance.find(filter);
  const worker = await Worker.findById(workerId);

  const totalDaysWorked = records.filter((r) => r.status === "Present").length;
  const halfDays = records.filter((r) => r.status === "Half Day").length;
  const absentDays = records.filter((r) => r.status === "Absent").length;
  const totalHours = records.reduce((sum, r) => sum + Number(r.hoursWorked || 0), 0);
  const totalSalary = records.reduce((sum, r) => sum + Number(r.laborCost || 0), 0);

  res.json({
    success: true,
    data: {
      totalDaysWorked,
      halfDays,
      absentDays,
      totalHours,
      totalSalary,
      netSalary: totalSalary,
      worker: worker
        ? { name: worker.name, rateType: worker.rateType, baseRate: worker.baseRate }
        : null,
    },
  });
});
