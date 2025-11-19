import { describe, expect, it } from 'vitest';
import { evaluateExpression, EvaluationError } from '../src/lib/bodmas';

describe('evaluateExpression', () => {
  it('follows multiplication before addition', () => {
    const { value, steps } = evaluateExpression('2 + 2 * 4');
    expect(value).toBe(10);
    expect(steps).toHaveLength(2);
    expect(steps[0].rule).toBe('multiplicationDivision');
    expect(steps[0].after).toContain('2 + 8');
    expect(steps[1].rule).toBe('additionSubtraction');
  });

  it('honours brackets and orders', () => {
    const { value, steps } = evaluateExpression('(8 - 2) ^ 2');
    expect(value).toBe(36);
    const bracketStep = steps.find((step) => step.rule === 'grouping');
    expect(bracketStep).toBeTruthy();
    const orderStep = steps.find((step) => step.rule === 'exponents');
    expect(orderStep).toBeTruthy();
    expect(orderStep?.after).toContain('36');
  });

  it('records a single bracket step per grouped expression', () => {
    const { steps } = evaluateExpression('12 / (2 + 1) + 3');
    const bracketSteps = steps.filter((step) => step.rule === 'grouping');
    expect(bracketSteps).toHaveLength(1);
    expect(bracketSteps[0].before).toContain('( 2 + 1 )');
    expect(bracketSteps[0].after).toContain('/ 3 +');
  });

  it('errors on invalid syntax', () => {
    expect(() => evaluateExpression('((2+3)')).toThrow(EvaluationError);
  });

  it('blocks division by zero', () => {
    expect(() => evaluateExpression('5 / 0')).toThrow(EvaluationError);
  });
});
