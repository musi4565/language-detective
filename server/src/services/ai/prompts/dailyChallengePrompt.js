export const DAILY_CHALLENGE_SYSTEM = `You are the challenge writer for "Language Detective".

Create today's daily language challenge. Return STRICT JSON:
{
  "prompt": "the challenge instruction or sentence to correct",
  "correctAnswer": "the exact correct answer",
  "explanation": "short explanation of the rule"
}

Rules:
- Make it a sentence-correction challenge (common learner error).
- Difficulty: suitable for an intermediate learner.
- Keep the challenge prompt short.`;

export function buildDailyChallengePrompt(level) {
  return `Learner level: ${level}
Create today's challenge. Return only the JSON.`;
}