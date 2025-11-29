import { evaluateExpression, type BodmasStep } from './bodmas';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

const buildDivisiblePair = (rng: () => number, min = 2, max = 10): [number, number] => {
  const divisor = randomInt(min, max, rng);
  const multiplier = randomInt(min, max, rng);
  return [divisor * multiplier, divisor];
};

const randomPower = (
  rng: () => number,
  baseRange: [number, number] = [2, 6],
  exponentRange: [number, number] = [2, 3]
): { base: number; exponent: number; value: number } => {
  const base = randomInt(baseRange[0], baseRange[1], rng);
  const exponent = randomInt(exponentRange[0], exponentRange[1], rng);
  const value = Math.pow(base, exponent);
  return { base, exponent, value };
};

const pickFactor = (value: number, rng: () => number): number => {
  const factors = new Set<number>([1, value]);
  const limit = Math.floor(Math.sqrt(value));
  for (let i = 2; i <= limit; i += 1) {
    if (value % i === 0) {
      factors.add(i);
      factors.add(value / i);
    }
  }
  return pick([...factors], rng);
};

const buildEasyExpression = (rng: () => number): string => {
  const templates: Array<() => string> = [
    () => {
      const a = randomInt(4, 20, rng);
      const b = randomInt(3, 18, rng);
      const c = randomInt(2, 9, rng);
      const d = randomInt(2, 12, rng);
      return `(${a} + ${b}) * ${c} - ${d}`;
    },
    () => {
      const a = randomInt(5, 18, rng);
      const b = randomInt(3, 12, rng);
      const c = randomInt(2, 10, rng);
      const d = randomInt(2, 9, rng);
      const e = randomInt(3, 15, rng);
      return `${a} + ${b} * ${c} - (${d} + ${e})`;
    },
    () => {
      const a = randomInt(6, 22, rng);
      const b = randomInt(2, 8, rng);
      const c = randomInt(3, 14, rng);
      const d = randomInt(2, 8, rng);
      return `${a} - (${b} + ${c}) + ${d} * ${randomInt(2, 5, rng)}`;
    },
    () => {
      const a = randomInt(3, 15, rng);
      const b = randomInt(3, 15, rng);
      const c = randomInt(3, 15, rng);
      const d = randomInt(2, 7, rng);
      return `(${a} + ${b} + ${c}) - ${d} * ${randomInt(2, 6, rng)}`;
    }
  ];

  return pick(templates, rng)();
};

const buildMediumExpression = (rng: () => number): string => {
  const templates: Array<() => string> = [
    () => {
      const { base, exponent } = randomPower(rng);
      const m = randomInt(3, 10, rng);
      const n = randomInt(3, 10, rng);
      const offset = randomInt(2, 12, rng);
      return `(${base} ^ ${exponent}) + (${m} * ${n}) - ${offset}`;
    },
    () => {
      const left = randomInt(4, 12, rng) + randomInt(3, 10, rng);
      const square = left * left;
      const divisor = pickFactor(square, rng);
      const adjustment = randomInt(2, 9, rng);
      return `((${left} ^ 2) / ${divisor}) + ${adjustment}`;
    },
    () => {
      const { base, exponent } = randomPower(rng, [2, 5], [2, 3]);
      const [dividend, divisor] = buildDivisiblePair(rng, 2, 8);
      const addition = randomInt(3, 14, rng);
      return `${base} ^ ${exponent} + (${dividend} / ${divisor}) + ${addition}`;
    },
    () => {
      const { base, exponent, value } = randomPower(rng, [2, 6], [2, 3]);
      const divisor = pickFactor(value, rng);
      const multiplier = randomInt(2, 9, rng);
      return `(${base} ^ ${exponent}) - (${multiplier} * ${divisor}) + ${multiplier}`;
    }
  ];

  return pick(templates, rng)();
};

const buildHardExpression = (rng: () => number): string => {
  const templates: Array<() => string> = [
    () => {
      const { base, exponent, value } = randomPower(rng, [2, 6], [2, 3]);
      const divisor = pickFactor(value, rng);
      const a = randomInt(6, 20, rng);
      const b = randomInt(3, 12, rng);
      const c = randomInt(4, 16, rng);
      const d = randomInt(2, 10, rng);
      return `((${a} + ${b}) * (${c} - ${d})) + ((${base} ^ ${exponent}) / ${divisor})`;
    },
    () => {
      const { base, exponent, value } = randomPower(rng, [3, 7], [2, 3]);
      const divisor = pickFactor(value, rng);
      const [dividend, divider] = buildDivisiblePair(rng, 2, 9);
      const inner = `${dividend} / ${divider}`;
      const outerLeft = `${randomInt(8, 18, rng)} - (${randomInt(3, 9, rng)} + ${randomInt(2, 8, rng)})`;
      return `((${outerLeft}) + (${inner})) - (${base} ^ ${exponent}) / ${divisor}`;
    },
    () => {
      const { base, exponent } = randomPower(rng, [2, 5], [3, 3]);
      const nestingInner = `${randomInt(4, 12, rng)} - ${randomInt(2, 6, rng)}`;
      const nestingOuter = `${randomInt(6, 16, rng)} + (${nestingInner})`;
      const [dividend, divisor] = buildDivisiblePair(rng, 2, 8);
      return `((${nestingOuter}) * (${randomInt(3, 9, rng)} - ${randomInt(2, 7, rng)})) + (${base} ^ ${exponent}) / ${divisor}`;
    },
    () => {
      const { base, exponent, value } = randomPower(rng, [2, 6], [2, 3]);
      const divisor = pickFactor(value, rng);
      const layered = `(${randomInt(5, 15, rng)} - (${randomInt(2, 8, rng)} + ${randomInt(2, 8, rng)}))`;
      const multiplier = `${randomInt(2, 9, rng)} + ${randomInt(2, 9, rng)}`;
      return `((${layered}) * (${multiplier})) + (((${base} ^ ${exponent}) / ${divisor}) - ${randomInt(2, 8, rng)})`;
    }
  ];

  return pick(templates, rng)();
};

const buildExpression = (difficulty: Difficulty, rng: () => number): string => {
  switch (difficulty) {
    case 'easy':
      return buildEasyExpression(rng);
    case 'medium':
      return buildMediumExpression(rng);
    case 'hard':
    default:
      return buildHardExpression(rng);
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
  let expression = '';
  let evaluation = { value: 0, steps: [] as BodmasStep[] };

  for (let attempts = 0; attempts < 50; attempts += 1) {
    expression = buildExpression(difficulty, rng);
    try {
      const result = evaluateExpression(expression);
      if (Number.isInteger(result.value)) {
        evaluation = result;
        break;
      }
    } catch {
      // Try again with a new expression
    }
  }

  if (!Number.isInteger(evaluation.value)) {
    throw new Error('Failed to generate an integer-valued quiz question.');
  }

  const options = shuffle([evaluation.value, ...buildDistractors(evaluation.value, rng)], rng);
  return {
    difficulty,
    expression,
    answer: evaluation.value,
    steps: evaluation.steps,
    options
  };
};
