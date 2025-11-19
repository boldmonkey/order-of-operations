import { describe, expect, it } from 'vitest';
import { evaluateExpression } from '../src/lib/bodmas';
import { generateQuestion, type Difficulty } from '../src/lib/quiz-generator';

const createDeterministicRng = () => {
  let seed = 1;
  return () => {
    seed = (seed * 48271) % 0x7fffffff;
    return seed / 0x7fffffff;
  };
};

describe('generateQuestion', () => {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  difficulties.forEach((difficulty) => {
    it(`builds accurate ${difficulty} quizzes`, () => {
      const rng = createDeterministicRng();
      const question = generateQuestion(difficulty, rng);
      const evaluation = evaluateExpression(question.expression);
      expect(question.answer).toBe(evaluation.value);
      expect(question.options).toContain(question.answer);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.steps.length).toBeGreaterThan(0);
      expect(question.difficulty).toBe(difficulty);
    });
  });

  it('randomises expressions across calls', () => {
    const rng = createDeterministicRng();
    const first = generateQuestion('medium', rng);
    const second = generateQuestion('medium', rng);
    expect(first.expression).not.toBe(second.expression);
  });
});
