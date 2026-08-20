import prisma from "../lib/prisma.js";
import { success, paginate } from "../utils/apiResponse.js";
import { notFoundError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { computeReview } from "../services/spacedRepetition.service.js";
import { addXp, trackDailyProgress, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const listMistakes = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { skip, take, page, limit } = paginate(req.query.page, req.query.limit);
  const { category, topic, severity, search } = req.query;

  const where = { userId };
  if (category) where.category = category;
  if (topic) where.topic = topic;
  if (severity) where.severity = severity;
  if (search) {
    where.OR = [
      { originalText: { contains: search, mode: "insensitive" } },
      { correctedText: { contains: search, mode: "insensitive" } },
      { topic: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.mistake.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.mistake.count({ where }),
  ]);

  success(res, { items, total, page, limit });
});

export const mistakeStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const mistakes = await prisma.mistake.findMany({ where: { userId } });

  const byCategory = {};
  for (const m of mistakes) {
    byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  }

  const bySeverity = {};
  for (const m of mistakes) {
    bySeverity[m.severity] = (bySeverity[m.severity] || 0) + 1;
  }

  const byTopic = {};
  for (const m of mistakes) {
    if (m.topic) byTopic[m.topic] = (byTopic[m.topic] || 0) + 1;
  }

  // mistakes over time: last 30 days
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const overTime = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    overTime[key] = 0;
  }
  for (const m of mistakes) {
    if (m.createdAt >= last30) {
      const key = m.createdAt.toISOString().slice(0, 10);
      if (key in overTime) overTime[key]++;
    }
  }

  const mostCommon = Object.entries(byTopic)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const mastered = mistakes.filter((m) => m.masteryScore >= 80).length;
  const due = mistakes.filter((m) => !m.nextReviewAt || m.nextReviewAt <= new Date()).length;

  success(res, {
    total: mistakes.length,
    byCategory,
    bySeverity,
    byTopic,
    overTime,
    mostCommon,
    mastered,
    due,
    averageMastery: mistakes.length
      ? Math.round(mistakes.reduce((s, m) => s + m.masteryScore, 0) / mistakes.length)
      : 0,
  });
});

export const getMistake = asyncHandler(async (req, res) => {
  const mistake = await prisma.mistake.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!mistake) throw notFoundError("Mistake not found");
  success(res, { mistake });
});

export const reviewMistake = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isCorrect } = req.validated.body;
  const userId = req.user.id;

  const mistake = await prisma.mistake.findFirst({ where: { id, userId } });
  if (!mistake) throw notFoundError("Mistake not found");

  const review = computeReview(
    mistake.masteryScore,
    mistake.correctCount,
    mistake.incorrectCount,
    isCorrect
  );

  const updated = await prisma.mistake.update({
    where: { id },
    data: {
      masteryScore: review.mastery,
      correctCount: review.correct,
      incorrectCount: review.incorrect,
      reviewCount: { increment: 1 },
      nextReviewAt: review.nextReviewAt,
      lastReviewedAt: new Date(),
    },
  });

  if (isCorrect) {
    await addXp(userId, XP.MISTAKE_REVIEW, "Mistake review");
    await trackDailyProgress(userId, "mistakesCorrected");
  }
  await checkAndUnlockAchievements(userId);

  success(res, {
    mistake: updated,
    nextReviewInDays: review.interval,
    xpEarned: isCorrect ? XP.MISTAKE_REVIEW : 0,
  });
});

export const dueMistakes = asyncHandler(async (req, res) => {
  const now = new Date();
  const items = await prisma.mistake.findMany({
    where: {
      userId: req.user.id,
      OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }],
    },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });
  success(res, { items, count: items.length });
});