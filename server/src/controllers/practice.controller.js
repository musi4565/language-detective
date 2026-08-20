import prisma from "../lib/prisma.js";
import { generateExercise } from "../services/ai/aiOrchestrator.js";
import { success } from "../utils/apiResponse.js";
import { notFoundError, badRequestError, ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { computeReview } from "../services/spacedRepetition.service.js";
import { addXp, trackDailyProgress, updateStreak, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

async function getWeakestTopics(userId, limit = 3) {
  const mistakes = await prisma.mistake.findMany({
    where: { userId, topic: { not: null } },
    select: { topic: true, masteryScore: true, createdAt: true },
  });
  const byTopic = {};
  for (const m of mistakes) {
    if (!m.topic) continue;
    if (!byTopic[m.topic]) {
      byTopic[m.topic] = { topic: m.topic, count: 0, totalMastery: 0, recent: m.createdAt };
    }
    byTopic[m.topic].count++;
    byTopic[m.topic].totalMastery += m.masteryScore;
    if (m.createdAt > byTopic[m.topic].recent) byTopic[m.topic].recent = m.createdAt;
  }
  return Object.values(byTopic)
    .map((t) => ({ topic: t.topic, count: t.count, avgMastery: t.totalMastery / t.count, recent: t.recent }))
    .sort((a, b) => a.avgMastery - b.avgMastery || b.count - a.count || b.recent - a.recent)
    .slice(0, limit);
}

export const getPracticeSet = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const count = Math.min(parseInt(req.query.count || "5", 10) || 5, 10);

  const topics = await getWeakestTopics(userId, 3);
  const topicPool = topics.length
    ? topics.map((t) => t.topic)
    : ["Past Simple", "Articles", "Prepositions"];

  const exercises = [];
  const failed = [];

  for (let i = 0; i < count; i++) {
    const topic = topicPool[i % topicPool.length];
    const recentMistake = await prisma.mistake.findFirst({
      where: { userId, topic },
      orderBy: { createdAt: "desc" },
    });

    let data = null;
    try {
      data = await generateExercise({
        topic,
        level: req.user.level || "B1",
        nativeLanguage: req.user.nativeLanguage,
        recentMistake,
      });
    } catch (e) {
      failed.push({ topic, reason: e.message });
    }

    if (data) {
      const exercise = await prisma.exercise.create({
        data: {
          userId,
          type: data.type,
          prompt: data.prompt,
          options: data.options,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || null,
          topic: data.topic || topic,
          category: recentMistake?.category || "GRAMMAR",
          sourceMistakeId: recentMistake?.id || null,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      exercises.push({
        id: exercise.id,
        type: exercise.type,
        prompt: exercise.prompt,
        options: exercise.options,
        topic: exercise.topic,
        category: exercise.category,
      });
    }
  }

  // If AI failed completely (e.g. provider not configured), propagate the error
  if (exercises.length === 0 && failed.length > 0) {
    throw new ApiError(503, failed[0].reason);
  }

  success(res, { exercises, topics: topicPool, aiFailed: exercises.length === 0 });
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { answer } = req.validated.body;
  const userId = req.user.id;

  const exercise = await prisma.exercise.findFirst({ where: { id, userId } });
  if (!exercise) throw notFoundError("Exercise not found");
  if (exercise.completed) throw badRequestError("This exercise was already completed");

  const normalize = (s) => s.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  const isCorrect = normalize(answer) === normalize(exercise.correctAnswer);

  await prisma.exerciseAttempt.create({
    data: { userId, exerciseId: id, answer, isCorrect },
  });

  await prisma.exercise.update({
    where: { id },
    data: { completed: true },
  });

  let updatedMistake = null;
  if (exercise.sourceMistakeId) {
    const mistake = await prisma.mistake.findUnique({ where: { id: exercise.sourceMistakeId } });
    if (mistake) {
      const review = computeReview(
        mistake.masteryScore,
        mistake.correctCount,
        mistake.incorrectCount,
        isCorrect
      );
      updatedMistake = await prisma.mistake.update({
        where: { id: mistake.id },
        data: {
          masteryScore: review.mastery,
          correctCount: review.correct,
          incorrectCount: review.incorrect,
          reviewCount: { increment: 1 },
          nextReviewAt: review.nextReviewAt,
          lastReviewedAt: new Date(),
        },
      });
    }
  }

  const xpEarned = isCorrect ? XP.PRACTICE_COMPLETED : 0;
  if (isCorrect) {
    await addXp(userId, XP.PRACTICE_COMPLETED, "Practice completed");
    await trackDailyProgress(userId, "exercisesCompleted");
  }
  await updateStreak(userId);
  const achievements = await checkAndUnlockAchievements(userId);

  success(res, {
    isCorrect,
    correctAnswer: exercise.correctAnswer,
    explanation: exercise.explanation,
    xpEarned,
    mastery: updatedMistake ? { id: updatedMistake.id, masteryScore: updatedMistake.masteryScore, nextReviewAt: updatedMistake.nextReviewAt } : null,
    achievements,
  });
});

export const practiceHistory = asyncHandler(async (req, res) => {
  const attempts = await prisma.exerciseAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { exercise: { select: { topic: true, type: true, prompt: true } } },
  });
  const total = await prisma.exerciseAttempt.count({ where: { userId: req.user.id } });
  const correct = await prisma.exerciseAttempt.count({ where: { userId: req.user.id, isCorrect: true } });
  success(res, {
    attempts,
    total,
    correct,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
  });
});