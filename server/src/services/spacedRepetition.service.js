const INTERVALS = [1, 2, 4, 7, 14, 30];

/**
 * Spaced repetition for mistakes/vocabulary.
 * On correct answer: mastery increases and next review moves to the next interval.
 * On incorrect answer: mastery decreases and next review resets to a shorter interval.
 */
export function computeReview(masteryScore, correctCount, incorrectCount, isCorrect) {
  let mastery = masteryScore || 0;
  let correct = correctCount || 0;
  let incorrect = incorrectCount || 0;

  if (isCorrect) {
    correct += 1;
    mastery = Math.min(100, mastery + 20);
  } else {
    incorrect += 1;
    mastery = Math.max(0, mastery - 30);
  }

  const intervalIndex = Math.min(Math.max(correct - 1, 0), INTERVALS.length - 1);
  // On an incorrect answer the review cycle resets to the shortest interval
  const interval = isCorrect ? INTERVALS[intervalIndex] : INTERVALS[0];

  const nextReviewAt = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  return { mastery, correct, incorrect, nextReviewAt, interval };
}

export function dueItems(items) {
  const now = new Date();
  return items.filter((i) => !i.nextReviewAt || i.nextReviewAt <= now);
}

export const REVIEW_INTERVALS_DAYS = INTERVALS;