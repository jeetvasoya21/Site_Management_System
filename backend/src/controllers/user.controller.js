import User from "../models/user.model.js";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  verified: user.verified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
});

export const listUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (typeof isActive === "boolean") filter.isActive = isActive;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: users.map(sanitizeUser) });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, data: sanitizeUser(user) });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, isActive = true, verified = true } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "",
    role,
    isActive,
    verified,
  });

  res.status(201).json({ success: true, data: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { name, phone, role, isActive, verified } = req.body;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (verified !== undefined) user.verified = verified;

  await user.save();

  res.json({ success: true, data: sanitizeUser(user) });
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isActive = false;
  user.refreshSessions = [];
  await user.save();

  res.json({ success: true, data: sanitizeUser(user) });
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isActive = true;
  await user.save();

  res.json({ success: true, data: sanitizeUser(user) });
});
