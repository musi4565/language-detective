import prisma from "../lib/prisma.js";
import { generateDailyChallenge } from "../services/ai/aiOrchestrator.js";
import { success } from "../utils/apiResponse.js";
import { badRequestError } from "../utils/apiError.js";
import { asyncHandler, startOfDay, normalizeLevel } from "../utils/helpers.js";
import { addXp, trackDailyProgress, updateStreak, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const today = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  let challenge = await prisma.dailyChallenge.findUnique({ where: { date: today } });

  if (!challenge) {
    try {
      const ai = await generateDailyChallenge(req.user.level || "B1");
      challenge = await prisma.dailyChallenge.create({
        data: {
          date: today,
          prompt: ai.prompt,
          correctAnswer: ai.correctAnswer,
          explanation: ai.explanation || null,
        },
      });
    } catch {
      challenge = await prisma.dailyChallenge.create({
        data: {
          date: today,
          prompt: "Correct this sentence: She don't like coffee.",
          correctAnswer: "She doesn't like coffee.",
          explanation: "Third person singular (she) takes \"doesn't\" in the present simple.",
        },
      });
    }
  }

  const attempt = await prisma.dailyChallengeAttempt.findUnique({
    where: { userId_challengeId: { userId: req.user.id, challengeId: challenge.id } },
  });

  const { correctAnswer, ...safe } = challenge;
  // No attempt → hide the answer so the user tries first.
  // Attempted → reveal the answer + explanation so the user can learn from it.
  success(res, { challenge: attempt ? challenge : { ...safe, correctAnswer: undefined }, attempt });
});

export const submit = asyncHandler(async (req, res) => {
  const today = startOfDay(new Date());
  const challenge = await prisma.dailyChallenge.findUnique({ where: { date: today } });
  if (!challenge) throw badRequestError("No challenge available today");

  const existing = await prisma.dailyChallengeAttempt.findUnique({
    where: { userId_challengeId: { userId: req.user.id, challengeId: challenge.id } },
  });
  if (existing) throw badRequestError("You already answered today's challenge");

  const { answer } = req.validated.body;
  const normalize = (s) => s.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ");
  const isCorrect = normalize(answer) === normalize(challenge.correctAnswer);

  const attempt = await prisma.dailyChallengeAttempt.create({
    data: { userId: req.user.id, challengeId: challenge.id, answer, isCorrect },
  });

  const xpEarned = isCorrect ? XP.DAILY_CHALLENGE : 0;
  if (isCorrect) {
    await addXp(req.user.id, XP.DAILY_CHALLENGE, "Daily challenge");
  }
  await updateStreak(req.user.id);
  const achievements = await checkAndUnlockAchievements(req.user.id);

  success(res, {
    isCorrect,
    correctAnswer: isCorrect ? challenge.correctAnswer : undefined,
    explanation: isCorrect ? challenge.explanation : undefined,
    xpEarned,
    attempt,
    achievements,
  });
});