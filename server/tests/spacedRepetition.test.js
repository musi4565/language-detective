import { test } from "node:test";
import assert from "node:assert/strict";
import { computeReview, dueItems, REVIEW_INTERVALS_DAYS } from "../src/services/spacedRepetition.service.js";

test("correct answer increases mastery by 20", () => {
  const r = computeReview(50, 0, 0, true);
  assert.equal(r.mastery, 70);
});

test("correct answer moves to next review interval", () => {
  const r1 = computeReview(0, 0, 0, true);
  assert.equal(r1.interval, REVIEW_INTERVALS_DAYS[0]);
  const r2 = computeReview(20, 1, 0, true);
  assert.equal(r2.interval, REVIEW_INTERVALS_DAYS[1]);
  const r3 = computeReview(40, 5, 0, true);
  assert.equal(r3.interval, REVIEW_INTERVALS_DAYS[5]);
});

test("incorrect answer decreases mastery by 30", () => {
  const r = computeReview(70, 3, 1, false);
  assert.equal(r.mastery, 40);
});

test("incorrect answer shortens interval", () => {
  const r = computeReview(60, 4, 0, false);
  assert.equal(r.interval, REVIEW_INTERVALS_DAYS[0]);
});

test("mastery is capped at 100", () => {
  const r = computeReview(90, 6, 0, true);
  assert.equal(r.mastery, 100);
});

test("mastery is floored at 0", () => {
  const r = computeReview(10, 0, 5, false);
  assert.equal(r.mastery, 0);
});

test("dueItems returns items past due", () => {
  const past = { nextReviewAt: new Date(Date.now() - 1000) };
  const future = { nextReviewAt: new Date(Date.now() + 100000) };
  const none = { nextReviewAt: null };
  assert.equal(dueItems([past, future, none]).length, 2);
});