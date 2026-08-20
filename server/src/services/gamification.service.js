import prisma from "../lib/prisma.js";
import { startOfDay } from "../utils/helpers.js";

export const XP = {
  WRITING_ANALYSIS: 10,
  PRACTICE_COMPLETED: 10,
  SPEAKING_SESSION: 15,
  DAILY_CHALLENGE: 20,
  MISTAKE_REVIEW: 5,
  VOCAB_REVIEW: 5,
};

async function getTodayProgress(userId, date) {
  const d = startOfDay(date);
  return prisma.dailyProgress.upsert({
    where: { userId_date: { userId, date: d } },
    update: {},
    create: { userId, date: d },
  });
}

export async function addXp(userId, amount, reason = "") {
  const today = await getTodayProgress(userId, new Date());
  await prisma.dailyProgress.update({
    where: { id: today.id },
    data: { xpEarned: { increment: amount } },
  });
  return prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
}

export async function trackDailyProgress(userId, field, amount = 1) {
  const allowed = [
    "writingAnalyses",
    "exercisesCompleted",
    "speakingSessions",
    "mistakesCorrected",
    "vocabularyLearned",
  ];
  if (!allowed.includes(field)) return null;
  const today = await getTodayProgress(userId, new Date());
  return prisma.dailyProgress.update({
    where: { id: today.id },
    data: { [field]: { increment: amount } },
  });
}

export async function updateStreak(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let streak = user.streak;
  if (!user.lastActiveDate) {
    streak = 1;
  } else {
    const last = startOfDay(user.lastActiveDate);
    const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // same day, keep streak
    } else if (diffDays === 1) {
      streak += 1;
    } else {
      streak = 1;
    }
  }
  return prisma.user.update({
    where: { id: userId },
    data: { streak, lastActiveDate: today },
  });
}

const ACHIEVEMENT_CHECKS = {
  FIRST_ANALYSIS: async (userId) => {
    const c = await prisma.writingSubmission.count({ where: { userId } });
    return c >= 1;
  },
  STREAK_7: async (userId) => {
    const u = await prisma.user.findUnique({ where: { id: userId } });
    return u.streak >= 7;
  },
  MISTAKES_100: async (userId) => {
    const agg = await prisma.mistake.aggregate({
      where: { userId },
      _sum: { correctCount: true },
    });
    return (agg._sum.correctCount || 0) >= 100;
  },
  WORDS_100: async (userId) => {
    const c = await prisma.vocabulary.count({ where: { userId } });
    return c >= 100;
  },
  GRAMMAR_MASTER: async (userId) => {
    const topics = await prisma.mistake.findMany({
      where: { userId, category: "GRAMMAR" },
      distinct: ["topic"],
      select: { topic: true },
    });
    return topics.filter((t) => t.topic).length >= 10;
  },
  WRITING_MASTER: async (userId) => {
    const c = await prisma.writingSubmission.count({ where: { userId, overallScore: { gte: 90 } } });
    return c >= 5;
  },
  SPEAKING_STARTER: async (userId) => {
    const c = await prisma.speakingSession.count({ where: { userId } });
    return c >= 1;
  },
  PRACTICE_50: async (userId) => {
    const c = await prisma.exerciseAttempt.count({ where: { userId } });
    return c >= 50;
  },
};

export async function checkAndUnlockAchievements(userId) {
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const all = await prisma.achievement.findMany();
  const newlyUnlocked = [];

  for (const ach of all) {
    if (unlockedIds.has(ach.id)) continue;
    const check = ACHIEVEMENT_CHECKS[ach.code];
    if (check) {
      try {
        const ok = await check(userId);
        if (ok) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: ach.id },
          });
          if (ach.xpReward > 0) {
            await addXp(userId, ach.xpReward, `Achievement: ${ach.title}`);
          }
          newlyUnlocked.push(ach);
        }
      } catch (e) {
        // ignore per-check errors
      }
    }
  }
  return newlyUnlocked;
}