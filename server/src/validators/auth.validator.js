import { z } from "zod";

const email = z.string().email("Invalid email address").max(255);
const password = z.string().min(6, "Password must be at least 6 characters").max(100);
const name = z.string().min(1, "Name is required").max(100);

export const registerSchema = z.object({
  body: z.object({
    name,
    email,
    password,
    nativeLanguage: z.string().min(1).max(50).default("English"),
    learningLanguage: z.string().min(1).max(50).default("English"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: name.optional(),
    nativeLanguage: z.string().min(1).max(50).optional(),
    learningLanguage: z.string().min(1).max(50).optional(),
    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
    avatar: z.string().max(500).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: password,
  }),
});

export const setLevelSchema = z.object({
  body: z.object({
    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  }),
});

export const completeOnboardingSchema = z.object({
  body: z.object({
    nativeLanguage: z.string().min(1).max(50),
    learningLanguage: z.string().min(1).max(50),
    level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  }),
});