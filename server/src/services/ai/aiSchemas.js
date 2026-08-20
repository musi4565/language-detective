import { z } from "zod";

const mistakeSchema = z.object({
  original: z.string().min(1).max(500),
  correction: z.string().min(1).max(500),
  category: z.enum([
    "GRAMMAR",
    "VOCABULARY",
    "SPELLING",
    "WORD_ORDER",
    "TENSE",
    "PREPOSITION",
    "ARTICLE",
    "SENTENCE_STRUCTURE",
    "PRONUNCIATION",
  ]).catch("GRAMMAR"),
  topic: z.string().max(100).optional().catch(undefined),
  explanation: z.string().min(1).max(2000),
  severity: z.enum(["low", "medium", "high"]).catch("medium"),
});

export const writingAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100).catch(70),
  correctedText: z.string().min(1).max(20000),
  summary: z.string().max(3000).optional().catch(undefined),
  mistakes: z.array(mistakeSchema).default([]).catch([]),
  strengths: z.array(z.string()).default([]).catch([]),
  weaknesses: z.array(z.string()).default([]).catch([]),
  recommendedTopics: z.array(z.string()).default([]).catch([]),
});

export const exerciseSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE", "FILL_BLANK", "CORRECT_SENTENCE", "TRANSLATE", "REARRANGE"]).catch("FILL_BLANK"),
  prompt: z.string().min(1).max(2000),
  options: z.array(z.string()).default([]).catch([]),
  correctAnswer: z.string().min(1).max(500),
  explanation: z.string().min(1).max(2000).optional().catch(undefined),
  topic: z.string().max(100).optional().catch(undefined),
});

export const chatResponseSchema = z.object({
  reply: z.string().min(1).max(5000),
  corrections: z.array(
    z.object({
      original: z.string().min(1).max(500),
      correction: z.string().min(1).max(500),
      explanation: z.string().min(1).max(1000).optional().catch(undefined),
      category: z.string().max(50).optional().catch(undefined),
    })
  ).default([]).catch([]),
});

export const speakingAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100).catch(70),
  pronunciation: z.number().min(0).max(100).optional().catch(undefined),
  grammar: z.number().min(0).max(100).optional().catch(undefined),
  fluency: z.number().min(0).max(100).optional().catch(undefined),
  vocabulary: z.number().min(0).max(100).optional().catch(undefined),
  feedback: z.string().min(1).max(3000).optional().catch(undefined),
  mistakes: z.array(
    z.object({
      original: z.string().min(1).max(500),
      correction: z.string().min(1).max(500),
      explanation: z.string().min(1).max(1000).optional().catch(undefined),
      category: z.string().max(50).optional().catch(undefined),
    })
  ).default([]).catch([]),
});

export const vocabularySchema = z.object({
  word: z.string().min(1).max(100),
  translation: z.string().min(1).max(500).optional().catch(undefined),
  definition: z.string().min(1).max(2000).optional().catch(undefined),
  example: z.string().min(1).max(1000).optional().catch(undefined),
  pronunciation: z.string().max(200).optional().catch(undefined),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
});

export const dailyChallengeSchema = z.object({
  prompt: z.string().min(1).max(1000),
  correctAnswer: z.string().min(1).max(1000),
  explanation: z.string().min(1).max(2000).optional().catch(undefined),
});

export const placementResultSchema = z.object({
  score: z.number().min(0).max(100),
  recommendedLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  weakAreas: z.array(z.string()).default([]).catch([]),
  strongAreas: z.array(z.string()).default([]).catch([]),
});