import prisma from "../lib/prisma.js";
import { explainVocabulary } from "../services/ai/aiOrchestrator.js";
import { success, paginate } from "../utils/apiResponse.js";
import { conflictError, notFoundError, badRequestError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { computeReview } from "../services/spacedRepetition.service.js";
import { addXp, trackDailyProgress, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const listVocabulary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { skip, take } = paginate(req.query.page, req.query.limit);
  const where = { userId };
  if (req.query.difficulty) where.difficulty = req.query.difficulty;
  if (req.query.due === "true") {
    where.OR = [{ nextReviewAt: null }, { nextReviewAt: { lte: new Date() } }];
  }
  if (req.query.search) {
    where.OR = [
      { word: { contains: req.query.search, mode: "insensitive" } },
      { translation: { contains: req.query.search, mode: "insensitive" } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.vocabulary.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.vocabulary.count({ where }),
  ]);
  success(res, { items, total });
});

export const addWord = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { word } = req.validated.body;

  const existing = await prisma.vocabulary.findUnique({ where: { userId_word: { userId, word: word.toLowerCase().trim() } } });
  if (existing) throw conflictError("This word is already in your vocabulary");

  let data = { ...req.validated.body, word: word.toLowerCase().trim() };

  // Auto-fill from AI when user only provides the word
  if (!data.translation && !data.definition && !data.example) {
    const ai = await explainVocabulary(data.word, req.user.nativeLanguage);
    data = {
      word: ai.word || data.word,
      translation: ai.translation || null,
      definition: ai.definition || null,
      example: ai.example || null,
      pronunciation: ai.pronunciation || null,
      difficulty: ai.difficulty || "medium",
    };
  }

  const item = await prisma.vocabulary.create({ data: { ...data, userId } });
  await addXp(userId, 5, "Word added");
  await trackDailyProgress(userId, "vocabularyLearned");
  await checkAndUnlockAchievements(userId);

  success(res, { item }, 201);
});

export const deleteWord = asyncHandler(async (req, res) => {
  const existing = await prisma.vocabulary.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) throw notFoundError("Word not found");
  await prisma.vocabulary.delete({ where: { id: existing.id } });
  success(res, { message: "Word removed" });
});

export const reviewWord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isCorrect } = req.validated.body;
  const userId = req.user.id;

  const item = await prisma.vocabulary.findFirst({ where: { id, userId } });
  if (!item) throw notFoundError("Word not found");

  const review = computeReview(item.masteryScore, item.correctCount, item.incorrectCount, isCorrect);

  const updated = await prisma.vocabulary.update({
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

  await prisma.vocabularyReview.create({
    data: { vocabularyId: id, userId, isCorrect },
  });

  if (isCorrect) {
    await addXp(userId, XP.VOCAB_REVIEW, "Vocabulary review");
  }
  await checkAndUnlockAchievements(userId);

  success(res, { item: updated, nextReviewInDays: review.interval, xpEarned: isCorrect ? XP.VOCAB_REVIEW : 0 });
});