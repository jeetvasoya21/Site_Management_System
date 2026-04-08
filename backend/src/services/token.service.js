import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const ACCESS_COOKIE_NAME = "siteos_access_token";
const REFRESH_COOKIE_NAME = "siteos_refresh_token";

const expiresToMs = (value) => {
  const match = /^(\d+)([smhd])$/i.exec(value);
  if (!match) {
    throw new Error(`Unsupported expiresIn format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      type: "access",
    },
    env.accessTokenSecret,
    { expiresIn: env.accessTokenExpiresIn }
  );

export const signRefreshToken = (user, sessionId) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      sid: sessionId,
      type: "refresh",
    },
    env.refreshTokenSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.accessTokenSecret);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.refreshTokenSecret);

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  domain: env.cookieDomain,
  path: "/",
};

export const getAccessCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: expiresToMs(env.accessTokenExpiresIn),
});

export const getRefreshCookieOptions = () => ({
  ...baseCookieOptions,
  maxAge: expiresToMs(env.refreshTokenExpiresIn),
});

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, getAccessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

export const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, getAccessCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, getRefreshCookieOptions());
};

export const getAccessTokenFromRequest = (req) => {
  if (req.cookies?.[ACCESS_COOKIE_NAME]) {
    return req.cookies[ACCESS_COOKIE_NAME];
  }

  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

export const getRefreshTokenFromRequest = (req) => req.cookies?.[REFRESH_COOKIE_NAME] || null;

export const createSessionMetadata = (req) => ({
  userAgent: req.get("user-agent") || "unknown",
  ipAddress: req.ip,
  expiresAt: new Date(Date.now() + expiresToMs(env.refreshTokenExpiresIn)),
});

export const ACCESS_COOKIE = ACCESS_COOKIE_NAME;
export const REFRESH_COOKIE = REFRESH_COOKIE_NAME;
