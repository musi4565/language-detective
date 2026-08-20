import prisma from "../lib/prisma.js";
import { success, paginate } from "../utils/apiResponse.js";
import { notFoundError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";

export const listUsers = asyncHandler(async (req, res) => {
  const { skip, take, page, limit } = paginate(req.query.page, req.query.limit);
  const where = {};
  if (req.query.search) {
    where.OR = [
      { name: { contains: req.query.search, mode: "insensitive" } },
      { email: { contains: req.query.search, mode: "insensitive" } },
    ];
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, level: true, xp: true,
        streak: true, blocked: true, createdAt: true, lastActiveDate: true,
        _count: { select: { mistakes: true, writingSubmissions: true, exerciseAttempts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  success(res, { users, total, page, limit });
});

export const toggleBlock = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw notFoundError("User not found");
  if (user.role === "ADMIN") {
    return res.status(400).json({ success: false, message: "Cannot block an admin" });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { blocked: !user.blocked },
  });
  success(res, { user: { id: updated.id, blocked: updated.blocked } });
});

export const userStats = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { mistakes: true, writingSubmissions: true, exerciseAttempts: true, vocabulary: true, speakingSessions: true } } },
  });
  if (!user) throw notFoundError("User not found");
  success(res, { user });
});

export const analytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalAnalyses,
    totalExercises,
    totalAttempts,
    totalMistakes,
    totalChats,
    totalSpeaking,
    languages,
    commonMistakes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastActiveDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.writingSubmission.count(),
    prisma.exercise.count(),
    prisma.exerciseAttempt.count(),
    prisma.mistake.count(),
    prisma.chatMessage.count(),
    prisma.speakingSession.count(),
    prisma.user.groupBy({ by: ["learningLanguage"], _count: { learningLanguage: true }, orderBy: { _count: { learningLanguage: "desc" } }, take: 10 }),
    prisma.mistake.groupBy({ by: ["topic"], _count: { topic: true }, orderBy: { _count: { topic: "desc" } }, take: 10, where: { topic: { not: null } } }),
  ]);

  success(res, {
    totalUsers,
    activeUsers,
    totalAnalyses,
    totalExercises,
    totalAttempts,
    totalMistakes,
    totalChats,
    totalSpeaking,
    popularLanguages: languages.map((l) => ({ language: l.learningLanguage, count: l._count.learningLanguage })),
    commonMistakes: commonMistakes.map((m) => ({ topic: m.topic, count: m._count.topic })),
  });
});

export const listMistakes = asyncHandler(async (req, res) => {
  const { skip, take } = paginate(req.query.page, req.query.limit);
  const [items, total] = await Promise.all([
    prisma.mistake.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.mistake.count(),
  ]);
  success(res, { items, total });
});

export const listLanguages = asyncHandler(async (req, res) => {
  const languages = await prisma.language.findMany({ orderBy: { name: "asc" } });
  success(res, { languages });
});

export const createLanguage = asyncHandler(async (req, res) => {
  const { code, name, flag } = req.validated.body;
  const language = await prisma.language.create({ data: { code, name, flag } });
  success(res, { language }, 201);
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const language = await prisma.language.update({
    where: { id: req.params.id },
    data: req.validated.body,
  });
  success(res, { language });
});

export const deleteLanguage = asyncHandler(async (req, res) => {
  await prisma.language.delete({ where: { id: req.params.id } });
  success(res, { message: "Language deleted" });
});