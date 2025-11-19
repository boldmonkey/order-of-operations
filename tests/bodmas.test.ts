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

  it('breaks out bracket work with rule-appropriate steps', () => {
    const { steps } = evaluateExpression('12 / (2 + 1) + 3');
    expect(steps).toHaveLength(3);

    const groupingStep = steps[0];
    expect(groupingStep.rule).toBe('grouping');
    expect(groupingStep.before).toBe('12 / ( 2 + 1 ) + 3');
    expect(groupingStep.after).toBe('12 / 3 + 3');
    expect(groupingStep.children).toHaveLength(1);
    expect(groupingStep.scope).toBe('global');

    const nestedAddition = groupingStep.children?.[0];
    expect(nestedAddition?.rule).toBe('additionSubtraction');
    expect(nestedAddition?.before).toBe('12 / ( 2 + 1 ) + 3');
    expect(nestedAddition?.after).toBe('12 / ( 3 ) + 3');
    expect(nestedAddition?.scope).toBe('group');
    expect(nestedAddition?.operator).toBe('+');

    expect(steps[1].rule).toBe('multiplicationDivision');
    expect(steps[1].before).toBe('12 / 3 + 3');
    expect(steps[1].after).toBe('4 + 3');
    expect(steps[1].scope).toBe('global');
    expect(steps[1].operator).toBe('/');

    expect(steps[2].rule).toBe('additionSubtraction');
    expect(steps[2].after).toBe('7');
    expect(steps[2].scope).toBe('global');
    expect(steps[2].operator).toBe('+');
  });

  it('still surfaces bracket depth information', () => {
    const { value, steps } = evaluateExpression('2 * (3 + (4 - 1))');
    expect(value).toBe(12);

    const groupingSteps = steps.filter((step) => step.rule === 'grouping');
    expect(groupingSteps).toHaveLength(2);
    expect(groupingSteps.map((step) => step.depth)).toEqual([2, 1]);

    expect(groupingSteps[0].before).toContain('( 4 - 1 )');
    expect(groupingSteps[0].after).toContain('( 3 + 3 )');
    expect(groupingSteps[0].scope).toBe('group');
    expect(groupingSteps[0].children).toHaveLength(1);
    expect(groupingSteps[0].children?.[0].before).toContain('( 4 - 1 )');
    expect(groupingSteps[0].children?.[0].after).toContain('( 3 )');
    expect(groupingSteps[0].children?.[0].scope).toBe('group');
    expect(groupingSteps[0].children?.[0].operator).toBe('-');

    expect(groupingSteps[1].before).toContain('( 3 + 3 )');
    expect(groupingSteps[1].after).toContain('2 * 6');
    expect(groupingSteps[1].scope).toBe('global');
    expect(groupingSteps[1].children).toHaveLength(1);
    expect(groupingSteps[1].children?.[0].before).toContain('( 3 + 3 )');
    expect(groupingSteps[1].children?.[0].after).toContain('( 6 )');
    expect(groupingSteps[1].children?.[0].scope).toBe('group');
    expect(groupingSteps[1].children?.[0].operator).toBe('+');
  });

  it('errors on invalid syntax', () => {
    expect(() => evaluateExpression('((2+3)')).toThrow(EvaluationError);
  });

  it('blocks division by zero', () => {
    expect(() => evaluateExpression('5 / 0')).toThrow(EvaluationError);
  });
});
