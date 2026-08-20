import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../middleware/auth.js";
import { success } from "../utils/apiResponse.js";
import { conflictError, unauthorizedError, badRequestError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { updateStreak } from "../services/gamification.service.js";

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  nativeLanguage: u.nativeLanguage,
  learningLanguage: u.learningLanguage,
  level: u.level,
  role: u.role,
  avatar: u.avatar,
  xp: u.xp,
  streak: u.streak,
  blocked: u.blocked,
  createdAt: u.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, nativeLanguage, learningLanguage } = req.validated.body;

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw conflictError("An account with this email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashed,
      nativeLanguage,
      learningLanguage,
    },
  });

  const token = signToken(user);
  success(res, { token, user: publicUser(user) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw unauthorizedError("Invalid email or password");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw unauthorizedError("Invalid email or password");

  if (user.blocked) throw unauthorizedError("Your account has been blocked. Contact support.");

  await updateStreak(user.id);
  const token = signToken(user);
  success(res, { token, user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  success(res, { user: publicUser(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = { ...req.validated.body };
  const user = await prisma.user.update({ where: { id: req.user.id }, data });
  success(res, { user: publicUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw badRequestError("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  success(res, { message: "Password updated successfully" });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const { nativeLanguage, learningLanguage, level } = req.validated.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { nativeLanguage, learningLanguage, level },
  });
  success(res, { user: publicUser(user) });
});