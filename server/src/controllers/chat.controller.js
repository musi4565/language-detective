import prisma from "../lib/prisma.js";
import { generateChatReply } from "../services/ai/aiOrchestrator.js";
import { success } from "../utils/apiResponse.js";
import { notFoundError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/helpers.js";
import { addXp, updateStreak, checkAndUnlockAchievements, XP } from "../services/gamification.service.js";

export const createSession = asyncHandler(async (req, res) => {
  const session = await prisma.chatSession.create({
    data: {
      userId: req.user.id,
      title: req.validated.body.title || "New conversation",
    },
  });
  success(res, { session }, 201);
});

export const listSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId: req.user.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: { _count: { select: { messages: true } } },
  });
  success(res, { sessions });
});

export const getSession = asyncHandler(async (req, res) => {
  const session = await prisma.chatSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!session) throw notFoundError("Session not found");
  success(res, { session });
});

export const deleteSession = asyncHandler(async (req, res) => {
  const session = await prisma.chatSession.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!session) throw notFoundError("Session not found");
  await prisma.chatSession.delete({ where: { id: session.id } });
  success(res, { message: "Session deleted" });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { sessionId, message } = req.validated.body;
  const userId = req.user.id;

  const session = await prisma.chatSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw notFoundError("Session not found");

  const history = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  const userMsg = await prisma.chatMessage.create({
    data: { sessionId, role: "USER", content: message },
  });

  const { reply, corrections } = await generateChatReply(message, history);

  const aiMsg = await prisma.chatMessage.create({
    data: {
      sessionId,
      role: "ASSISTANT",
      content: reply,
      corrections: corrections.length ? corrections : undefined,
    },
  });

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date(), title: session.title === "New conversation" ? message.slice(0, 50) : session.title },
  });

  // Save detected mistakes into the mistake database
  const savedCorrections = [];
  for (const c of corrections) {
    const mistake = await prisma.mistake.create({
      data: {
        userId,
        originalText: c.original,
        correctedText: c.correction,
        explanation: c.explanation || "Detected in AI conversation",
        category: (c.category || "GRAMMAR"),
        topic: null,
        severity: "medium",
        source: "chat",
      },
    });
    savedCorrections.push(mistake);
  }

  await updateStreak(userId);
  const achievements = await checkAndUnlockAchievements(userId);

  success(res, {
    userMessage: userMsg,
    aiMessage: aiMsg,
    corrections: savedCorrections,
    achievements,
  });
});