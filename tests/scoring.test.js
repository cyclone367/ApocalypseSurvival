import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../src/questions.js";
import { calculateScores, getEnding, getProgress, getSurvivalDays } from "../src/scoring.js";
import { results } from "../src/results.js";
import { recordChoice } from "../src/game-flow.js";

test("calculates all four attributes from selected answers", () => {
  const answers = [0, 1, null];
  const score = calculateScores(answers, [
    { options: [{ scores: { survival: 3, social: 0, sanity: 2, chaos: 0 } }] },
    { options: [{}, { scores: { survival: 0, social: 3, sanity: 1, chaos: 0 } }] },
    { options: [{ scores: { survival: 50, social: 50, sanity: 50, chaos: 50 } }] }
  ]);
  assert.deepEqual(score, { survival: 3, social: 3, sanity: 3, chaos: 0 });
});

test("progress reports completed answers and rounded percentage", () => {
  assert.deepEqual(getProgress([0, null, 2, undefined], 15), { completed: 2, total: 15, percent: 13 });
  assert.deepEqual(getProgress([], 0), { completed: 0, total: 0, percent: 0 });
});

test("assigns all eight standard endings and both hidden easter eggs", () => {
  assert.equal(getEnding({ survival: 0, social: 0, sanity: 0, chaos: 24 }), results.chaosProtocol);
  assert.equal(getEnding({ survival: 28, social: 0, sanity: 0, chaos: 0 }), results.homeOffice);
  assert.equal(getEnding({ survival: 30, social: 5, sanity: 10, chaos: 6 }), results.extremeSurvivor);
  assert.equal(getEnding({ survival: 15, social: 30, sanity: 10, chaos: 0 }), results.groupAdmin);
  assert.equal(getEnding({ survival: 10, social: 10, sanity: 30, chaos: 0 }), results.commander);
  assert.equal(getEnding({ survival: 25, social: 10, sanity: 5, chaos: 0 }), results.shopkeeper);
  assert.equal(getEnding({ survival: 10, social: 25, sanity: 5, chaos: 0 }), results.goodPerson);
  assert.equal(getEnding({ survival: 15, social: 5, sanity: 10, chaos: 0 }), results.soloPlayer);
  assert.equal(getEnding({ survival: 0, social: 0, sanity: 0, chaos: 0 }), results.luckyDrifter);
  assert.equal(getEnding({ survival: 0, social: 0, sanity: 0, chaos: 17 }), results.humanBug);
});

test("game content has fifteen days with four complete choices each", () => {
  assert.equal(questions.length, 15);
  questions.forEach((question, index) => {
    assert.equal(question.day, index + 1);
    assert.equal(question.options.length, 4);
    question.options.forEach((option) => {
      assert.ok(option.feedback);
      assert.deepEqual(Object.keys(option.scores).sort(), ["chaos", "sanity", "social", "survival"]);
    });
  });
  assert.equal(getSurvivalDays(Array(15).fill(0)), 15);
});

test("records a choice and advances immediately, including the final answer", () => {
  const answers = [null, null];
  const gameQuestions = [
    { options: [{ feedback: "Day one recorded." }] },
    { options: [{ feedback: "Final day recorded." }] }
  ];

  const next = recordChoice(answers, 0, 0, gameQuestions);
  assert.deepEqual(next, {
    answers: [0, null],
    feedback: "Day one recorded.",
    nextIndex: 1,
    isComplete: false
  });
  assert.equal(answers[0], null);

  const revised = recordChoice(next.answers, 0, 0, [
    { options: [{ feedback: "Revised day one choice." }] },
    gameQuestions[1]
  ]);
  assert.equal(revised.feedback, "Revised day one choice.");
  assert.deepEqual(revised.answers, [0, null]);

  const final = recordChoice(next.answers, 1, 0, gameQuestions);
  assert.deepEqual(final, {
    answers: [0, 0],
    feedback: "Final day recorded.",
    nextIndex: 2,
    isComplete: true
  });
});

test("result presentation separates ending number, title, and category", () => {
  const [endingNumber, endingCategory] = results.groupAdmin.subtitle.split(" · ");
  assert.equal(endingNumber, "结局 02");
  assert.equal(results.groupAdmin.title, "末日群主");
  assert.equal(endingCategory, "社区协调者");
});
