import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { env } from "../config/env.js";
import { unauthorizedError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";

export const signToken = (user) => {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const authRequired = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw unauthorizedError("Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw unauthorizedError("Invalid or expired token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw unauthorizedError("User no longer exists");
  if (user.blocked) throw unauthorizedError("Your account has been blocked");

  req.user = user;
  next();
});

export const adminRequired = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user && !user.blocked) req.user = user;
    } catch {
      // ignore invalid token on optional routes
    }
  }
  next();
});