import prisma from "../lib/prisma.js";
import { success } from "../utils/apiResponse.js";
import { badRequestError, notFoundError } from "../utils/apiError.js";
import { asyncHandler, normalizeLevel } from "../utils/helpers.js";
import { addXp, updateStreak, checkAndUnlockAchievements } from "../services/gamification.service.js";

export const getTest = asyncHandler(async (req, res) => {
  const test = await prisma.placementTest.findFirst({
    where: { language: "English" },
    include: { questions: true },
  });
  if (!test) throw notFoundError("Placement test not found");
  const { correctAnswer, ...rest } = test.questions[0] || {};
  success(res, {
    test: { ...test, questions: test.questions.map(({ correctAnswer, ...q }) => q) },
  });
});

const LEVEL_SCORE = { A1: 30, A2: 45, B1: 60, B2: 75, C1: 88, C2: 95 };

function recommendLevel(percentage) {
  if (percentage >= 92) return "C2";
  if (percentage >= 82) return "C1";
  if (percentage >= 68) return "B2";
  if (percentage >= 52) return "B1";
  if (percentage >= 35) return "A2";
  return "A1";
}

function scoreCategory(correctByType, totalByType) {
  if (!totalByType) return { score: 0, ratio: 0 };
  const score = Math.round((correctByType / totalByType) * 100);
  return { score, ratio: correctByType / totalByType };
}

export const submitTest = asyncHandler(async (req, res) => {
  const { testId, answers } = req.validated.body;
  const userId = req.user.id;

  const test = await prisma.placementTest.findUnique({
    where: { id: testId },
    include: { questions: true },
  });
  if (!test) throw notFoundError("Placement test not found");

  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  const questions = test.questions;
  const normalize = (s) => s.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");

  let correct = 0;
  const correctByType = { GRAMMAR: 0, VOCABULARY: 0, READING: 0 };
  const totalByType = { GRAMMAR: 0, VOCABULARY: 0, READING: 0 };
  const weakAreas = [];
  const strongAreas = [];

  for (const q of questions) {
    totalByType[q.type] = (totalByType[q.type] || 0) + 1;
    const userAnswer = answerMap.get(q.id);
    if (userAnswer && normalize(userAnswer) === normalize(q.correctAnswer)) {
      correct++;
      correctByType[q.type] = (correctByType[q.type] || 0) + 1;
    }
  }

  const percentage = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const recommendedLevel = recommendLevel(percentage);

  for (const type of ["GRAMMAR", "VOCABULARY", "READING"]) {
    const { score, ratio } = scoreCategory(correctByType[type], totalByType[type]);
    if (ratio >= 0.7) strongAreas.push(type === "GRAMMAR" ? "Grammar" : type === "VOCABULARY" ? "Vocabulary" : "Reading Comprehension");
    else if (ratio < 0.5) weakAreas.push(type === "GRAMMAR" ? "Grammar" : type === "VOCABULARY" ? "Vocabulary" : "Reading Comprehension");
  }

  const result = await prisma.placementResult.create({
    data: {
      userId,
      testId,
      score: correct,
      total: questions.length,
      percentage,
      recommendedLevel,
      weakAreas,
      strongAreas,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { level: recommendedLevel },
  });

  await addXp(userId, 20, "Placement test");
  await updateStreak(userId);
  const achievements = await checkAndUnlockAchievements(userId);

  success(res, {
    result,
    score: percentage,
    recommendedLevel,
    weakAreas,
    strongAreas,
    xpEarned: 20,
    achievements,
  });
});

export const history = asyncHandler(async (req, res) => {
  const results = await prisma.placementResult.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  success(res, { results });
});