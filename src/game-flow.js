export function recordChoice(answers, current, optionIndex, questions) {
  const option = questions[current]?.options[optionIndex];
  if (!option) throw new RangeError("The selected option does not exist.");

  const nextIndex = current + 1;
  return {
    answers: answers.map((answer, index) => index === current ? optionIndex : answer),
    feedback: option.feedback,
    nextIndex,
    isComplete: nextIndex >= questions.length
  };
}

export function resetRun(state, questionCount) {
  state.current = 0;
  state.answers = Array(questionCount).fill(null);
  state.feedback = "";
}
