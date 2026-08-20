export const VOCABULARY_SYSTEM = `You are a vocabulary expert for language learners.

Explain a word for an English learner. Return STRICT JSON:
{
  "word": "the word",
  "translation": "translation into the learner's native language",
  "definition": "simple English definition",
  "example": "one natural example sentence using the word",
  "pronunciation": "IPA or simple phonetic hint",
  "difficulty": "easy | medium | hard"
}`;

export function buildVocabularyUserPrompt(word, nativeLanguage) {
  return `Word: "${word}"
Learner native language: ${nativeLanguage}
Return the JSON explanation.`;
}