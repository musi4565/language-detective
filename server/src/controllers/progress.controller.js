import prisma from "../lib/prisma.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler, startOfDay } from "../utils/helpers.js";
import { checkAndUnlockAchievements } from "../services/gamification.service.js";

export const dashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const today = startOfDay(now);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    user,
    todayProgress,
    weeklyProgress,
    recentMistakes,
    dueCount,
    writingCount,
    writingAvg,
    exerciseTotalCount,
    exerciseCorrectCount,
    speakingAvg,
    achievements,
    weakestTopics,
    vocabDue,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.dailyProgress.findUnique({ where: { userId_date: { userId, date: today } } }),
    prisma.dailyProgress.findMany({ where: { userId, date: { gte: sevenDaysAgo } }, orderBy: { date: "asc" } }),
    prisma.mistake.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.mistake.count({ where: { userId, OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }] } }),
    prisma.writingSubmission.count({ where: { userId } }),
    prisma.writingSubmission.aggregate({ where: { userId }, _avg: { overallScore: true } }),
    prisma.exerciseAttempt.count({ where: { userId } }),
    prisma.exerciseAttempt.count({ where: { userId, isCorrect: true } }),
    prisma.speakingSession.aggregate({ where: { userId }, _avg: { overallScore: true } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    prisma.mistake.groupBy({
      by: ["topic"],
      where: { userId, topic: { not: null } },
      _count: { topic: true },
      _avg: { masteryScore: true },
      orderBy: { _count: { topic: "desc" } },
      take: 5,
    }),
    prisma.vocabulary.count({ where: { userId, OR: [{ nextReviewAt: null }, { nextReviewAt: { lte: now } }] } }),
  ]);

  const totalAttempts = exerciseTotalCount;
  const correctAttempts = exerciseCorrectCount;

  success(res, {
    user: {
      id: user.id,
      name: user.name,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      nativeLanguage: user.nativeLanguage,
      learningLanguage: user.learningLanguage,
    },
    todayProgress: todayProgress || null,
    weeklyProgress,
    stats: {
      writingAnalyses: writingCount,
      writingAvgScore: writingAvg._avg?.overallScore ? Math.round(writingAvg._avg.overallScore) : null,
      exercisesCompleted: totalAttempts,
      practiceAccuracy: totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : null,
      speakingAvgScore: speakingAvg._avg?.overallScore ? Math.round(speakingAvg._avg.overallScore) : null,
    },
    recentMistakes,
    dueForReview: dueCount,
    vocabDue,
    weakestTopics: weakestTopics
      .map((t) => ({ topic: t.topic, count: t._count.topic, avgMastery: t._avg.masteryScore ? Math.round(t._avg.masteryScore) : 0 }))
      .sort((a, b) => a.avgMastery - b.avgMastery)
      .slice(0, 3),
    achievements: achievements.map((a) => a.achievement),
  });
});

export const progress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, weekly, totals, userAchievements, mistakesByCategory] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.dailyProgress.findMany({
      where: { userId, date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { date: "asc" },
    }),
    prisma.dailyProgress.aggregate({
      where: { userId },
      _sum: {
        xpEarned: true,
        writingAnalyses: true,
        exercisesCompleted: true,
        speakingSessions: true,
        mistakesCorrected: true,
        vocabularyLearned: true,
      },
    }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    prisma.mistake.groupBy({
      by: ["category"],
      where: { userId },
      _count: { category: true },
    }),
  ]);

  const allAchievements = await prisma.achievement.findMany({ orderBy: { xpReward: "asc" } });
  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));
  const achievements = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) || null,
  }));

  const mistakesTotal = mistakesByCategory.reduce((s, c) => s + c._count.category, 0);

  // mistake reduction over time: group by week (last 8 weeks)
  const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);
  const mistakes = await prisma.mistake.findMany({
    where: { userId, createdAt: { gte: eightWeeksAgo } },
    select: { createdAt: true },
  });
  const weekBuckets = {};
  for (let w = 7; w >= 0; w--) {
    const d = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    weekBuckets[key] = 0;
  }
  for (const m of mistakes) {
    const created = new Date(m.createdAt);
    const weeksAgo = Math.min(Math.floor((Date.now() - created.getTime()) / (7 * 24 * 60 * 60 * 1000)), 7);
    const d = new Date(Date.now() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    if (key in weekBuckets) weekBuckets[key]++;
  }

  success(res, {
    stats: {
      totalXp: user.xp,
      streak: user.streak,
      level: user.level,
      writingAnalyses: totals._sum.writingAnalyses || 0,
      speakingSessions: totals._sum.speakingSessions || 0,
      exercisesCompleted: totals._sum.exercisesCompleted || 0,
      mistakesCorrected: totals._sum.mistakesCorrected || 0,
      vocabularyLearned: totals._sum.vocabularyLearned || 0,
      xpEarnedAllTime: totals._sum.xpEarned || 0,
      mistakesTotal,
    },
    weekly,
    mistakeTrend: weekBuckets,
    achievements,
    mistakesByCategory,
  });
});

export const weeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - 6);
  const days = await prisma.dailyProgress.findMany({
    where: { userId, date: { gte: start } },
    orderBy: { date: "asc" },
  });
  success(res, { days });
});

export const skills = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [writing, speaking, totalAttempts, correctAttempts] = await Promise.all([
    prisma.writingSubmission.aggregate({ where: { userId }, _avg: { overallScore: true } }),
    prisma.speakingSession.aggregate({ where: { userId }, _avg: { overallScore: true } }),
    prisma.exerciseAttempt.count({ where: { userId } }),
    prisma.exerciseAttempt.count({ where: { userId, isCorrect: true } }),
  ]);
  success(res, {
    writing: writing._avg?.overallScore ? Math.round(writing._avg.overallScore) : 0,
    speaking: speaking._avg?.overallScore ? Math.round(speaking._avg.overallScore) : 0,
    practice: totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
  });
});