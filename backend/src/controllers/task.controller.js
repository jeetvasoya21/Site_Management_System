import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateTask = (query) =>
  query
    .populate("projectId", "projectName status")
    .populate("assignedTo", "name email role")
    .populate("workersAssigned", "name skillType")
    .populate("dependencies", "taskName status");

export const getAll = asyncHandler(async (req, res) => {
  const { projectId, status, assignedTo, search } = req.query;
  const filter = {};
  if (projectId) filter.projectId = projectId;
  if (status && status !== "all") filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.taskName = { $regex: search, $options: "i" };

  const tasks = await populateTask(Task.find(filter)).sort({ createdAt: -1 });
  res.json({ success: true, data: tasks });
});

export const getById = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id));
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json({ success: true, data: task });
});

export const create = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.projectId);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (req.body.assignedTo) {
    const assignee = await User.findById(req.body.assignedTo);
    if (!assignee) {
      throw new AppError("Assigned user not found", 404);
    }
  }

  const task = await Task.create(req.body);
  const populated = await populateTask(Task.findById(task._id));
  res.status(201).json({ success: true, data: populated });
});

export const update = asyncHandler(async (req, res) => {
  if (req.body.assignedTo) {
    const assignee = await User.findById(req.body.assignedTo);
    if (!assignee) {
      throw new AppError("Assigned user not found", 404);
    }
  }

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const populated = await populateTask(Task.findById(task._id));
  res.json({ success: true, data: populated });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id).populate("dependencies", "status");
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (status === "In Progress" && task.dependencies.length > 0) {
    const allDone = task.dependencies.every((dependency) => dependency.status === "Completed");
    if (!allDone) {
      throw new AppError("Cannot start: incomplete dependencies", 400);
    }
  }

  task.status = status;
  if (status === "Completed") task.progress = 100;
  await task.save();

  const populated = await populateTask(Task.findById(task._id));
  res.json({ success: true, data: populated });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const progress = Math.max(0, Math.min(100, Math.round(req.body.progress)));
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  task.progress = progress;
  if (progress === 100 && task.status !== "Completed") {
    task.status = "Completed";
  }
  await task.save();

  const populated = await populateTask(Task.findById(task._id));
  res.json({ success: true, data: populated });
});

export const remove = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json({ success: true, message: "Task deleted" });
});
