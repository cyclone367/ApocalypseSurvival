import { results } from "./results.js";

export const ATTRIBUTES = ["survival", "social", "sanity", "chaos"];

export function calculateScores(answers, questions) {
  const scores = { survival: 0, social: 0, sanity: 0, chaos: 0 };
  answers.forEach((optionIndex, questionIndex) => {
    if (optionIndex === null || optionIndex === undefined) return;
    const option = questions[questionIndex]?.options[optionIndex];
    if (!option) return;
    ATTRIBUTES.forEach((attribute) => {
      scores[attribute] += option.scores[attribute] ?? 0;
    });
  });
  return scores;
}

export function getProgress(answers, totalQuestions) {
  const completed = answers.filter((answer) => answer !== null && answer !== undefined).length;
  return {
    completed,
    total: totalQuestions,
    percent: totalQuestions === 0 ? 0 : Math.round((completed / totalQuestions) * 100)
  };
}

export function getEnding(scores) {
  if (scores.chaos >= 24) return results.chaosProtocol;
  if (scores.survival >= 28 && scores.chaos <= 5 && scores.social <= 8) return results.homeOffice;

  if (scores.chaos >= 17) return results.humanBug;
  if (scores.social >= 27 && scores.social >= scores.survival) return results.groupAdmin;
  if (scores.sanity >= 25 && scores.sanity >= scores.social && scores.sanity >= scores.survival) return results.commander;
  if (scores.survival >= 28 && scores.survival > scores.social + 6) return results.extremeSurvivor;
  if (scores.survival >= 20 && scores.social <= 13) return results.shopkeeper;
  if (scores.social >= 20 && scores.social > scores.survival) return results.goodPerson;
  if (scores.social <= 10 && scores.survival >= 15) return results.soloPlayer;
  return results.luckyDrifter;
}

export function getSurvivalDays(answers) {
  return Math.min(15, answers.filter((answer) => answer !== null && answer !== undefined).length);
}
