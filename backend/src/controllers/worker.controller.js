import Worker from "../models/worker.model.js";
import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const { skillType, search } = req.query;
  const filter = {};
  if (skillType) filter.skillType = skillType;
  if (search) filter.name = { $regex: search, $options: "i" };

  const workers = await Worker.find(filter)
    .populate("userId", "name email role")
    .sort({ name: 1 });
  res.json({ success: true, data: workers });
});

export const getById = asyncHandler(async (req, res) => {
  const worker = await Worker.findById(req.params.id).populate("userId", "name email role");
  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  res.json({ success: true, data: worker });
});

export const create = asyncHandler(async (req, res) => {
  if (req.body.userId) {
    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new AppError("Linked user not found", 404);
    }
  }

  const worker = await Worker.create(req.body);
  const populated = await Worker.findById(worker._id).populate("userId", "name email role");
  res.status(201).json({ success: true, data: populated });
});

export const update = asyncHandler(async (req, res) => {
  if (req.body.userId) {
    const user = await User.findById(req.body.userId);
    if (!user) {
      throw new AppError("Linked user not found", 404);
    }
  }

  const worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("userId", "name email role");
  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  res.json({ success: true, data: worker });
});

export const remove = asyncHandler(async (req, res) => {
  const worker = await Worker.findByIdAndDelete(req.params.id);
  if (!worker) {
    throw new AppError("Worker not found", 404);
  }

  res.json({ success: true, message: "Worker deleted" });
});
