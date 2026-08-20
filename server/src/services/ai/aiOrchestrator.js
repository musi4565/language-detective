import { aiComplete, aiChat } from "./aiService.js";
import {
  WRITING_ANALYSIS_SYSTEM,
  buildWritingUserPrompt,
} from "./prompts/writingAnalysisPrompt.js";
import {
  EXERCISE_GENERATION_SYSTEM,
  buildExercisePrompt,
} from "./prompts/exerciseGenerationPrompt.js";
import { CHAT_SYSTEM, buildChatUserPrompt } from "./prompts/chatPrompt.js";
import { SPEAKING_SYSTEM, buildSpeakingUserPrompt } from "./prompts/speakingPrompt.js";
import { VOCABULARY_SYSTEM, buildVocabularyUserPrompt } from "./prompts/vocabularyPrompt.js";
import { DAILY_CHALLENGE_SYSTEM, buildDailyChallengePrompt } from "./prompts/dailyChallengePrompt.js";
import {
  writingAnalysisSchema,
  exerciseSchema,
  speakingAnalysisSchema,
  vocabularySchema,
  dailyChallengeSchema,
} from "./aiSchemas.js";
import { ApiError } from "../../utils/apiError.js";

async function safeParse(schema, raw, context) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      502,
      `AI returned an invalid response for ${context}. Please try again.`,
      parsed.error.issues.slice(0, 5).map((i) => ({ path: i.path.join("."), message: i.message }))
    );
  }
  return parsed.data;
}

export async function analyzeWriting(text, nativeLanguage = "English") {
  const raw = await aiComplete(WRITING_ANALYSIS_SYSTEM, [
    { role: "user", content: buildWritingUserPrompt(text, nativeLanguage) },
  ]);
  return safeParse(writingAnalysisSchema, raw, "writing analysis");
}

export async function generateExercise({ topic, level = "B1", nativeLanguage = "English", recentMistake = null }) {
  const raw = await aiComplete(EXERCISE_GENERATION_SYSTEM, [
    { role: "user", content: buildExercisePrompt(topic, level, nativeLanguage, recentMistake) },
  ]);
  return safeParse(exerciseSchema, raw, "exercise generation");
}

export async function generateChatReply(userMessage, history = []) {
  return aiChat(CHAT_SYSTEM, [...history, { role: "user", content: buildChatUserPrompt(userMessage) }]);
}

export async function analyzeSpeaking(transcript) {
  const raw = await aiComplete(SPEAKING_SYSTEM, [
    { role: "user", content: buildSpeakingUserPrompt(transcript) },
  ]);
  return safeParse(speakingAnalysisSchema, raw, "speaking analysis");
}

export async function explainVocabulary(word, nativeLanguage = "English") {
  const raw = await aiComplete(VOCABULARY_SYSTEM, [
    { role: "user", content: buildVocabularyUserPrompt(word, nativeLanguage) },
  ]);
  return safeParse(vocabularySchema, raw, "vocabulary explanation");
}

export async function generateDailyChallenge(level = "B1") {
  const raw = await aiComplete(DAILY_CHALLENGE_SYSTEM, [
    { role: "user", content: buildDailyChallengePrompt(level) },
  ]);
  return safeParse(dailyChallengeSchema, raw, "daily challenge");
}