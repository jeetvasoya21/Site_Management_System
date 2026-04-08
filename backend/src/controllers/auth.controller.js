import User from "../models/user.model.js";
import { Types } from "mongoose";
import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  clearAuthCookies,
  createSessionMetadata,
  getRefreshTokenFromRequest,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";

const PUBLIC_SIGNUP_ROLES = new Set(["Site_Engineer", "Storekeeper", "Worker"]);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  verified: user.verified,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
});

const issueSessionTokens = async (user, req, res, { replaceSessionId } = {}) => {
  user.pruneExpiredSessions();

  const sessionId = replaceSessionId || new Types.ObjectId();
  const refreshToken = signRefreshToken(user, sessionId.toString());
  const accessToken = signAccessToken(user);
  const metadata = createSessionMetadata(req);
  const tokenHash = hashToken(refreshToken);

  if (replaceSessionId) {
    user.refreshSessions = user.refreshSessions.filter(
      (session) => session._id.toString() !== replaceSessionId.toString()
    );
  }

  user.refreshSessions.push({
    _id: sessionId,
    tokenHash,
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    expiresAt: metadata.expiresAt,
    lastUsedAt: new Date(),
  });

  await user.save();
  setAuthCookies(res, accessToken, refreshToken);
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const resolvedRole = PUBLIC_SIGNUP_ROLES.has(role) ? role : "Site_Engineer";

  const user = await User.create({
    name,
    email,
    password,
    phone: phone || "",
    role: resolvedRole,
    verified: true,
  });

  await issueSessionTokens(user, req, res);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: sanitizeUser(user),
  });
});

export const signup = register;

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.accountLocked && user.lockUntil && new Date() < new Date(user.lockUntil)) {
    throw new AppError("Account is locked. Try again later.", 423);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.accountLocked = true;
      user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    await user.save();
    throw new AppError("Invalid email or password", 401);
  }

  user.failedLoginAttempts = 0;
  user.accountLocked = false;
  user.lockUntil = null;
  user.lastLogin = new Date();

  await issueSessionTokens(user, req, res);

  res.json({
    success: true,
    message: "Login successful",
    user: sanitizeUser(user),
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromRequest(req);
  if (!token) {
    throw new AppError("Refresh token missing", 401);
  }

  const decoded = verifyRefreshToken(token);
  if (decoded.type !== "refresh") {
    throw new AppError("Invalid token type", 401);
  }

  const user = await User.findById(decoded.sub).select("+password");
  if (!user || !user.isActive) {
    clearAuthCookies(res);
    throw new AppError("Session no longer valid", 401);
  }

  user.pruneExpiredSessions();

  const currentSession = user.refreshSessions.find(
    (session) =>
      session._id.toString() === decoded.sid &&
      session.tokenHash === hashToken(token) &&
      session.expiresAt > new Date()
  );

  if (!currentSession) {
    user.refreshSessions = [];
    await user.save();
    clearAuthCookies(res);
    throw new AppError("Refresh token invalid or reused", 401);
  }

  await issueSessionTokens(user, req, res, { replaceSessionId: currentSession._id });

  res.json({
    success: true,
    message: "Session refreshed",
    user: sanitizeUser(user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  const token = getRefreshTokenFromRequest(req);

  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.sub);
      if (user) {
        user.refreshSessions = user.refreshSessions.filter(
          (session) => session._id.toString() !== decoded.sid
        );
        await user.save();
      }
    } catch {
      // Invalid refresh tokens are cleared client-side below.
    }
  }

  clearAuthCookies(res);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: sanitizeUser(user),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new AppError("Current password is incorrect", 400);
  }

  user.password = newPassword;
  user.lastPasswordChange = new Date();
  user.refreshSessions = [];
  await user.save();

  await issueSessionTokens(user, req, res);

  res.json({
    success: true,
    message: "Password changed successfully",
    user: sanitizeUser(user),
  });
});
