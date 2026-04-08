import WorkerAssignment from "../models/workerAssignment.model.js";
import Task from "../models/task.model.js";
import Worker from "../models/worker.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const { taskId, workerId } = req.query;
  const filter = {};
  if (taskId) filter.taskId = taskId;
  if (workerId) filter.workerId = workerId;

  const assignments = await WorkerAssignment.find(filter)
    .populate("workerId", "name skillType")
    .populate("taskId", "taskName projectId")
    .sort({ fromDate: -1 });

  res.json({ success: true, data: assignments });
});

export const create = asyncHandler(async (req, res) => {
  const [worker, task] = await Promise.all([
    Worker.findById(req.body.workerId),
    Task.findById(req.body.taskId),
  ]);

  if (!worker) {
    throw new AppError("Worker not found", 404);
  }
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const existing = await WorkerAssignment.findOne({
    workerId: req.body.workerId,
    taskId: req.body.taskId,
  });
  if (existing) {
    throw new AppError("Worker is already assigned to this task", 409);
  }

  const assignment = await WorkerAssignment.create(req.body);

  await Task.findByIdAndUpdate(req.body.taskId, {
    $addToSet: { workersAssigned: req.body.workerId },
  });

  const populated = await WorkerAssignment.findById(assignment._id)
    .populate("workerId", "name skillType")
    .populate("taskId", "taskName projectId");

  res.status(201).json({ success: true, data: populated });
});

export const remove = asyncHandler(async (req, res) => {
  const assignment = await WorkerAssignment.findByIdAndDelete(req.params.id);
  if (!assignment) {
    throw new AppError("Assignment not found", 404);
  }

  await Task.findByIdAndUpdate(assignment.taskId, {
    $pull: { workersAssigned: assignment.workerId },
  });

  res.json({ success: true, message: "Assignment removed" });
});
