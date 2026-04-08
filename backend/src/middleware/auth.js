import { AppError } from "./errorHandler.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getAccessTokenFromRequest, verifyAccessToken } from "../services/token.service.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = getAccessTokenFromRequest(req);

  if (!token) {
    throw new AppError("Not authorized, access token missing", 401);
  }

  const decoded = verifyAccessToken(token);
  if (decoded.type !== "access") {
    throw new AppError("Invalid token type", 401);
  }

  const user = await User.findById(decoded.sub).select("-password");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 401);
  }

  if (user.lastPasswordChange && decoded.iat * 1000 < user.lastPasswordChange.getTime()) {
    throw new AppError("Session expired. Please log in again.", 401);
  }

  req.user = user;
  next();
});

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized to access this resource`, 403)
      );
    }

    next();
  };
};
