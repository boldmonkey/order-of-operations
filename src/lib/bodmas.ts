import { nanoid } from '../utils/nanoid';

export type OrderConvention = 'bodmas' | 'birdmas' | 'pemdas';

export type OrderRule =
  | 'grouping'
  | 'exponents'
  | 'multiplicationDivision'
  | 'additionSubtraction';

export type EvaluationScope = 'global' | 'group';

export interface BodmasStep {
  id: string;
  rule: OrderRule;
  depth: number;
  before: string;
  after: string;
  operation: string;
  result: number;
  description: string;
  scope: EvaluationScope;
  operator?: Operator;
  children?: BodmasStep[];
}

export type Operator = '^' | '*' | '/' | '+' | '-';

export type Token =
  | { type: 'number'; value: number }
  | { type: 'operator'; value: Operator }
  | { type: 'paren'; value: '(' | ')' };

const describeStep = (
  rule: OrderRule,
  operation: string,
  scope: EvaluationScope,
  operator?: Operator
): string => {
  const trimmedOperation = operation.trim();
  const locationPhrase = scope === 'group' ? 'inside this group' : 'in the expression';
  if (rule === 'grouping') {
    const prefix =
      scope === 'group' ? 'Inside this group' : 'Based on evaluating groups from left to right';
    return `${prefix} ${trimmedOperation} must be resolved.`;
  }
  if (rule === 'exponents') {
    return `With grouped parts handled ${locationPhrase}, we evaluate the order ${trimmedOperation} next.`;
  }
  if (rule === 'multiplicationDivision') {
    const action = operator === '/' ? 'division' : 'multiplication';
    return `There are no brackets or orders ${locationPhrase}, so the next operation is the ${action} ${trimmedOperation}.`;
  }
  const action = operator === '-' ? 'subtraction' : 'addition';
  return `There are no brackets, orders, divisions, or multiplications ${locationPhrase}, so the only operation left is ${action} and we evaluate ${trimmedOperation} now.`;
};

const conventionLabels: Record<OrderConvention, Record<OrderRule, string>> = {
  bodmas: {
    grouping: 'Brackets',
    exponents: 'Orders',
    multiplicationDivision: 'Division/Multiplication',
    additionSubtraction: 'Addition/Subtraction'
  },
  birdmas: {
    grouping: 'Brackets',
    exponents: 'Indices/Roots',
    multiplicationDivision: 'Division/Multiplication',
    additionSubtraction: 'Addition/Subtraction'
  },
  pemdas: {
    grouping: 'Parentheses',
    exponents: 'Exponents',
    multiplicationDivision: 'Multiplication/Division',
    additionSubtraction: 'Addition/Subtraction'
  }
};

const ruleColors: Record<OrderRule, string> = {
  grouping: '#5e81ac',
  exponents: '#bf616a',
  multiplicationDivision: '#ebcb8b',
  additionSubtraction: '#a3be8c'
};

export const getRuleColor = (rule: OrderRule): string => ruleColors[rule];
export const getRuleLabel = (
  rule: OrderRule,
  convention: OrderConvention = 'bodmas'
): string => conventionLabels[convention][rule];

export interface EvaluationResult {
  value: number;
  steps: BodmasStep[];
}

export class EvaluationError extends Error {}

export const formatNumber = (value: number): number => {
  const rounded = Number(parseFloat(value.toFixed(6)));
  return Number.isInteger(rounded) ? Math.trunc(rounded) : rounded;
};

const isDigit = (char: string): boolean => /[0-9]/.test(char);

const isOperator = (value: string): value is Operator => '^*/+-'.includes(value);

export const tokenize = (expression: string): Token[] => {
  const tokens: Token[] = [];
  const trimmed = expression.replace(/\s+/g, '');
  let i = 0;

  while (i < trimmed.length) {
    const char = trimmed[i];

    if (isDigit(char) || char === '.') {
      let j = i + 1;
      while (j < trimmed.length && (isDigit(trimmed[j]) || trimmed[j] === '.')) {
        j += 1;
      }
      const value = Number(trimmed.slice(i, j));
      if (Number.isNaN(value)) {
        throw new EvaluationError('Invalid number in expression.');
      }
      tokens.push({ type: 'number', value });
      i = j;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push({ type: 'paren', value: char });
      i += 1;
      continue;
    }

    if (isOperator(char)) {
      const prev = tokens[tokens.length - 1];
      if (
        char === '-' &&
        (!prev || prev.type === 'operator' || (prev.type === 'paren' && prev.value === '('))
      ) {
        // Unary minus for numeric literal
        let j = i + 1;
        while (j < trimmed.length && trimmed[j] === ' ') {
          j += 1;
        }
        let consumed = false;
        if (j < trimmed.length && (isDigit(trimmed[j]) || trimmed[j] === '.')) {
          let k = j + 1;
          while (k < trimmed.length && (isDigit(trimmed[k]) || trimmed[k] === '.')) {
            k += 1;
          }
          const value = Number('-' + trimmed.slice(j, k));
          if (Number.isNaN(value)) {
            throw new EvaluationError('Invalid negative number.');
          }
          tokens.push({ type: 'number', value });
          i = k;
          consumed = true;
        }
        if (consumed) {
          continue;
        }
      }

      tokens.push({ type: 'operator', value: char });
      i += 1;
      continue;
    }

    throw new EvaluationError(`Unexpected character: ${char}`);
  }

  return tokens;
};

const tokensToString = (tokens: Token[]): string =>
  tokens
    .map((token) => {
      if (token.type === 'number') {
        return formatNumber(token.value).toString();
      }
      return token.value;
    })
    .join(' ');

const compute = (left: number, operator: Token['value'], right: number): number => {
  switch (operator) {
    case '^':
      return formatNumber(Math.pow(left, right));
    case '*':
      return formatNumber(left * right);
    case '/':
      if (right === 0) {
        throw new EvaluationError('Division by zero is not allowed.');
      }
      return formatNumber(left / right);
    case '+':
      return formatNumber(left + right);
    case '-':
      return formatNumber(left - right);
    default:
      throw new EvaluationError(`Unsupported operator: ${operator}`);
  }
};

const applyBinaryOperator = (
  tokens: Token[],
  operator: Token['value'],
  rule: OrderRule,
  steps: BodmasStep[],
  iterateReverse = false,
  depth = 0,
  scope: EvaluationScope = 'global'
): void => {
  const indices = [...tokens.keys()];
  if (iterateReverse) {
    indices.reverse();
  }

  for (const index of indices) {
    const token = tokens[index];
    if (token?.type !== 'operator' || token.value !== operator) {
      continue;
    }
    const leftToken = tokens[index - 1];
    const rightToken = tokens[index + 1];
    if (leftToken?.type !== 'number' || rightToken?.type !== 'number') {
      throw new EvaluationError('Operator missing numeric operands.');
    }

    const before = tokensToString(tokens);
    const operationTokens = tokens.slice(index - 1, index + 2);
    const resultValue = compute(leftToken.value, token.value, rightToken.value);
    tokens.splice(index - 1, 3, { type: 'number', value: resultValue });
    const after = tokensToString(tokens);

    const description = describeStep(rule, tokensToString(operationTokens), scope, token.value);

    steps.push({
      id: nanoid(),
      rule,
      depth,
      before,
      after,
      operation: tokensToString(operationTokens),
      result: resultValue,
      description,
      scope,
      operator: token.value
    });
  }
};

const calculateNestingDepth = (tokens: Token[], openIndex: number, baseDepth: number): number => {
  let depth = baseDepth;
  for (let i = 0; i <= openIndex; i += 1) {
    const token = tokens[i];
    if (token?.type === 'paren') {
      depth += token.value === '(' ? 1 : -1;
    }
  }
  return depth;
};

const evaluateTokens = (
  inputTokens: Token[],
  depth = 0,
  scope: EvaluationScope = 'global'
): EvaluationResult => {
  const tokens = inputTokens.map((token) => ({ ...token }));
  const steps: BodmasStep[] = [];

  const resolveParentheses = (): void => {
    let closeIndex = tokens.findIndex((token) => token.type === 'paren' && token.value === ')');
    while (closeIndex !== -1) {
      let openIndex = closeIndex;
      while (openIndex >= 0 && !(tokens[openIndex].type === 'paren' && tokens[openIndex].value === '(')) {
        openIndex -= 1;
      }
      if (openIndex < 0) {
        throw new EvaluationError('Mismatched parentheses detected.');
      }
      const innerTokens = tokens.slice(openIndex + 1, closeIndex);
      if (innerTokens.length === 0) {
        throw new EvaluationError('Empty parentheses are not allowed.');
      }
      const nestingDepth = calculateNestingDepth(tokens, openIndex, depth);
      const groupingScope: EvaluationScope =
        scope === 'group' || nestingDepth > 1 ? 'group' : 'global';
      const prefixTokens = tokens.slice(0, openIndex + 1);
      const suffixTokens = tokens.slice(closeIndex, tokens.length);
      const contextualize = (expression: string): string =>
        tokensToString([...prefixTokens, ...tokenize(expression), ...suffixTokens]);
      const innerResult = evaluateTokens(innerTokens, nestingDepth, 'group');
      const nestedSteps = innerResult.steps.map((innerStep) => ({
        ...innerStep,
        before: contextualize(innerStep.before),
        after: contextualize(innerStep.after)
      }));
      const before = tokensToString(tokens);
      const operationTokens = tokens.slice(openIndex, closeIndex + 1);
      tokens.splice(openIndex, closeIndex - openIndex + 1, {
        type: 'number',
        value: innerResult.value
      });
      const after = tokensToString(tokens);
      steps.push({
        id: nanoid(),
        rule: 'grouping',
        depth: nestingDepth,
        before,
        after,
        operation: tokensToString(operationTokens),
        result: innerResult.value,
        description: describeStep('grouping', tokensToString(operationTokens), groupingScope),
        scope: groupingScope,
        children: nestedSteps
      });

      closeIndex = tokens.findIndex((token) => token.type === 'paren' && token.value === ')');
    }

    if (tokens.some((token) => token.type === 'paren')) {
      throw new EvaluationError('Mismatched parentheses detected.');
    }
  };

  const resolveOrders = (): void => {
    applyBinaryOperator(tokens, '^', 'exponents', steps, true, depth, scope);
  };

  const resolveMultiplicationDivision = (): void => {
    let hasMulOrDiv = tokens.some(
      (token) => token.type === 'operator' && (token.value === '*' || token.value === '/')
    );
    while (hasMulOrDiv) {
      const index = tokens.findIndex(
        (token) => token.type === 'operator' && (token.value === '*' || token.value === '/')
      );
      if (index === -1) {
        break;
      }
      const op = tokens[index];
      applyBinaryOperator(tokens, op.value, 'multiplicationDivision', steps, false, depth, scope);
      hasMulOrDiv = tokens.some(
        (token) => token.type === 'operator' && (token.value === '*' || token.value === '/')
      );
    }
  };

  const resolveAdditionSubtraction = (): void => {
    let hasAddOrSub = tokens.some(
      (token) => token.type === 'operator' && (token.value === '+' || token.value === '-')
    );
    while (hasAddOrSub) {
      const index = tokens.findIndex(
        (token) => token.type === 'operator' && (token.value === '+' || token.value === '-')
      );
      if (index === -1) {
        break;
      }
      const op = tokens[index];
      applyBinaryOperator(tokens, op.value, 'additionSubtraction', steps, false, depth, scope);
      hasAddOrSub = tokens.some(
        (token) => token.type === 'operator' && (token.value === '+' || token.value === '-')
      );
    }
  };

  resolveParentheses();
  resolveOrders();
  resolveMultiplicationDivision();
  resolveAdditionSubtraction();

  if (tokens.length !== 1 || tokens[0].type !== 'number') {
    throw new EvaluationError('Could not fully evaluate expression.');
  }

  return { value: tokens[0].value, steps };
};

export const evaluateExpression = (expression: string): EvaluationResult => {
  if (!expression.trim()) {
    throw new EvaluationError('Enter an expression to evaluate.');
  }
  const tokens = tokenize(expression);
  if (tokens.length === 0) {
    throw new EvaluationError('Nothing to evaluate.');
  }
  return evaluateTokens(tokens);
};
