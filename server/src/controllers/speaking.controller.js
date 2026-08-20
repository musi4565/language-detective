import prisma from "../lib/prisma.js";
import { analyzeSpeaking } from "../services/ai/aiOrchestrator.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/helpers.js";
import { addXp, trackDailyProgress, updateStreak, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const analyzeTranscript = asyncHandler(async (req, res) => {
  const { transcript } = req.validated.body;
  const userId = req.user.id;

  const result = await analyzeSpeaking(transcript);

  const session = await prisma.speakingSession.create({
    data: {
      userId,
      transcript,
      overallScore: result.overallScore,
      pronunciation: result.pronunciation,
      grammar: result.grammar,
      fluency: result.fluency,
      vocabulary: result.vocabulary,
      feedback: result.feedback || null,
      mistakes: result.mistakes.length ? result.mistakes : undefined,
    },
  });

  // Save detected mistakes into mistake database
  for (const m of result.mistakes) {
    await prisma.mistake.create({
      data: {
        userId,
        originalText: m.original,
        correctedText: m.correction,
        explanation: m.explanation || "Detected in speaking session",
        category: m.category || "GRAMMAR",
        severity: "medium",
        source: "speaking",
      },
    });
  }

  await addXp(userId, XP.SPEAKING_SESSION, "Speaking session");
  await trackDailyProgress(userId, "speakingSessions");
  await updateStreak(userId);
  const achievements = await checkAndUnlockAchievements(userId);

  success(res, {
    session,
    xpEarned: XP.SPEAKING_SESSION,
    achievements,
  });
});

export const history = asyncHandler(async (req, res) => {
  const sessions = await prisma.speakingSession.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  success(res, { sessions });
});

export const getById = asyncHandler(async (req, res) => {
  const session = await prisma.speakingSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!session) throw Object.assign(new Error("Session not found"), { statusCode: 404 });
  success(res, { session });
});