import { z } from "zod";

export const analyzeWritingSchema = z.object({
  body: z.object({
    text: z.string().min(3, "Text must be at least 3 characters").max(5000, "Text is too long (max 5000 chars)"),
  }),
});

export const listSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    category: z.string().optional(),
    topic: z.string().optional(),
    severity: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const practiceSubmitSchema = z.object({
  body: z.object({
    answer: z.string().min(1, "Answer is required").max(1000),
  }),
});

export const reviewSchema = z.object({
  body: z.object({
    isCorrect: z.boolean(),
  }),
});

export const vocabularyAddSchema = z.object({
  body: z.object({
    word: z.string().min(1).max(100),
    translation: z.string().max(500).optional(),
    definition: z.string().max(2000).optional(),
    example: z.string().max(1000).optional(),
    pronunciation: z.string().max(200).optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  }),
});

export const chatMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1),
    message: z.string().min(1, "Message is required").max(2000),
  }),
});

export const chatSessionSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional(),
  }),
});

export const speakingAnalyzeSchema = z.object({
  body: z.object({
    transcript: z.string().min(1, "Transcript is empty").max(5000),
  }),
});

export const challengeSubmitSchema = z.object({
  body: z.object({
    answer: z.string().min(1, "Answer is required").max(1000),
  }),
});

export const placementSubmitSchema = z.object({
  body: z.object({
    testId: z.string().min(1),
    answers: z.array(
      z.object({
        questionId: z.string().min(1),
        answer: z.string().min(1).max(500),
      })
    ).min(5),
  }),
});

export const onboardingSchema = z.object({
  body: z.object({
    nativeLanguage: z.string().min(1).max(50),
    learningLanguage: z.string().min(1).max(50),
    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  }),
});

export const adminUserQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export const adminBlockSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});