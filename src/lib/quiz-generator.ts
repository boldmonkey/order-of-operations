import { evaluateExpression, type BodmasStep } from './bodmas';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface QuizQuestion {
  expression: string;
  answer: number;
  options: number[];
  steps: BodmasStep[];
  difficulty: Difficulty;
}

const pick = <T,>(values: T[], rng: () => number): T => {
  const index = Math.floor(rng() * values.length);
  return values[index];
};

const shuffle = <T,>(values: T[], rng: () => number): T[] => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const randomInt = (min: number, max: number, rng: () => number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

const buildEasyExpression = (rng: () => number): string => {
  const opPool: Array<'+' | '-' | '*'> = ['+', '-', '*'];
  const a = randomInt(2, 15, rng);
  const b = randomInt(2, 15, rng);
  const c = randomInt(2, 15, rng);
  const op1 = pick(opPool, rng);
  const op2 = pick(opPool, rng);
  return `${a} ${op1} ${b} ${op2} ${c}`;
};

const buildMediumExpression = (rng: () => number): string => {
  const opPool: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/'];
  const groupA = `(${randomInt(2, 15, rng)} ${pick(opPool, rng)} ${randomInt(2, 15, rng)})`;
  const groupB = `(${randomInt(2, 15, rng)} ${pick(opPool, rng)} ${randomInt(2, 15, rng)})`;
  const connector: Array<'+' | '-' | '*'> = ['+', '-', '*'];
  return `${groupA} ${pick(connector, rng)} ${groupB}`;
};

const buildHardExpression = (rng: () => number): string => {
  const opPool: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/'];
  const baseGroup = `(${randomInt(2, 12, rng)} ${pick(opPool, rng)} ${randomInt(2, 12, rng)})`;
  const exponent = randomInt(2, 3, rng);
  const trailingGroup = `(${randomInt(2, 12, rng)} ${pick(opPool, rng)} ${randomInt(2, 12, rng)})`;
  const connector: Array<'+' | '-' | '*'> = ['+', '-', '*'];
  return `${baseGroup} ^ ${exponent} ${pick(connector, rng)} ${trailingGroup}`;
};

const buildInsaneExpression = (rng: () => number): string => {
  const opPool: Array<'+' | '-' | '*' | '/'> = ['+', '-', '*', '/'];
  const connectorPool: Array<'+' | '-' | '*'> = ['+', '-', '*'];

  const buildPowerSegment = (): string => {
    const baseGroup = `(${randomInt(2, 12, rng)} ${pick(opPool, rng)} ${randomInt(2, 12, rng)})`;
    const exponent = randomInt(2, 3, rng);
    const adjuster = `(${randomInt(2, 12, rng)} ${pick(opPool, rng)} ${randomInt(2, 12, rng)})`;
    return `(${baseGroup} ^ ${exponent} ${pick(connectorPool, rng)} ${adjuster})`;
  };

  const buildMixedGroup = (): string => {
    const first = `(${randomInt(3, 15, rng)} ${pick(opPool, rng)} ${randomInt(3, 15, rng)})`;
    const second = `(${randomInt(3, 15, rng)} ${pick(opPool, rng)} ${randomInt(3, 15, rng)})`;
    return `(${first} ${pick(['*', '/'], rng)} ${second})`;
  };

  const combine = (left: string, right: string): string => `${left} ${pick(connectorPool, rng)} ${right}`;

  return combine(combine(buildPowerSegment(), buildPowerSegment()), buildMixedGroup());
};

const buildExpression = (difficulty: Difficulty, rng: () => number): string => {
  switch (difficulty) {
    case 'easy':
      return buildEasyExpression(rng);
    case 'medium':
      return buildMediumExpression(rng);
    case 'hard':
      return buildHardExpression(rng);
    case 'insane':
      return buildInsaneExpression(rng);
    default:
      return buildMediumExpression(rng);
  }
};

const buildDistractors = (answer: number, rng: () => number): number[] => {
  const distractors = new Set<number>();
  while (distractors.size < 3) {
    const offset = randomInt(-6, 6, rng);
    if (offset === 0) {
      continue;
    }
    distractors.add(Number((answer + offset).toFixed(4)));
  }
  return [...distractors];
};

export const generateQuestion = (
  difficulty: Difficulty,
  rng: () => number = Math.random
): QuizQuestion => {
  const expression = buildExpression(difficulty, rng);
  const evaluation = evaluateExpression(expression);
  const options = shuffle([evaluation.value, ...buildDistractors(evaluation.value, rng)], rng);
  return {
    difficulty,
    expression,
    answer: evaluation.value,
    steps: evaluation.steps,
    options
  };
};
