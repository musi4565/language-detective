import prisma from "../lib/prisma.js";
import { analyzeWriting } from "../services/ai/aiOrchestrator.js";
import { success, paginate } from "../utils/apiResponse.js";
import { badRequestError, notFoundError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { addXp, trackDailyProgress, updateStreak, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const analyze = asyncHandler(async (req, res) => {
  const { text } = req.validated.body;
  const userId = req.user.id;

  const result = await analyzeWriting(text, req.user.nativeLanguage);

  const submission = await prisma.writingSubmission.create({
    data: {
      userId,
      originalText: text,
      correctedText: result.correctedText,
      overallScore: result.overallScore,
      summary: result.summary || null,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendedTopics: result.recommendedTopics,
    },
  });

  const mistakes = [];
  for (const m of result.mistakes) {
    const mistake = await prisma.mistake.create({
      data: {
        userId,
        originalText: m.original,
        correctedText: m.correction,
        explanation: m.explanation,
        category: m.category,
        topic: m.topic || null,
        severity: m.severity,
        source: "writing",
      },
    });
    mistakes.push(mistake);
  }

  await addXp(userId, XP.WRITING_ANALYSIS, "Writing analysis");
  await trackDailyProgress(userId, "writingAnalyses");
  await updateStreak(userId);
  const achievements = await checkAndUnlockAchievements(userId);

  success(res, {
    analysis: {
      id: submission.id,
      overallScore: submission.overallScore,
      correctedText: submission.correctedText,
      summary: submission.summary,
      strengths: submission.strengths,
      weaknesses: submission.weaknesses,
      recommendedTopics: submission.recommendedTopics,
      createdAt: submission.createdAt,
    },
    mistakes,
    xpEarned: XP.WRITING_ANALYSIS,
    achievements,
  });
});

export const history = asyncHandler(async (req, res) => {
  const { skip, take } = paginate(req.query.page, req.query.limit);
  const userId = req.user.id;
  const [items, total] = await Promise.all([
    prisma.writingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.writingSubmission.count({ where: { userId } }),
  ]);
  success(res, { items, total });
});

export const getById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const submission = await prisma.writingSubmission.findFirst({
    where: { id, userId: req.user.id },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
  if (!submission) throw notFoundError("Submission not found");
  const mistakes = await prisma.mistake.findMany({
    where: { userId: req.user.id, source: "writing" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  success(res, { submission, mistakes });
});