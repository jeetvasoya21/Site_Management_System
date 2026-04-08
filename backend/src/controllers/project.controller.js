import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateProject = (query) =>
  query
    .populate("createdBy", "name email role")
    .populate("members.userId", "name email role");

export const getAll = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (search) filter.projectName = { $regex: search, $options: "i" };

  const projects = await populateProject(Project.find(filter)).sort({ createdAt: -1 });
  res.json({ success: true, data: projects });
});

export const getById = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.json({ success: true, data: project });
});

export const create = asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, createdBy: req.user._id });
  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json({ success: true, data: populated });
});

export const update = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const populated = await populateProject(Project.findById(project._id));
  res.json({ success: true, data: populated });
});

export const remove = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.json({ success: true, message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const user = await User.findById(req.body.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const exists = project.members.some((member) => member.userId.toString() === req.body.userId);
  if (exists) {
    throw new AppError("User already a member", 409);
  }

  project.members.push(req.body);
  await project.save();

  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json({ success: true, data: populated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const beforeCount = project.members.length;
  project.members = project.members.filter(
    (member) => member._id.toString() !== req.params.memberId
  );

  if (project.members.length === beforeCount) {
    throw new AppError("Project member not found", 404);
  }

  await project.save();
  const populated = await populateProject(Project.findById(project._id));
  res.json({ success: true, data: populated });
});
