import { useMemo } from 'react';
import { EvaluationError, formatNumber, tokenize, type Operator, type Token } from '../lib/bodmas';

type MathNode =
  | { type: 'number'; value: number }
  | { type: 'binary'; operator: Operator; left: MathNode; right: MathNode }
  | { type: 'group'; child: MathNode };

type Position = 'left' | 'right';

type ParseResult = {
  node: MathNode | null;
  error: string | null;
};

const unwrapGroup = (node: MathNode): MathNode => {
  if (node.type === 'group') {
    return unwrapGroup(node.child);
  }
  return node;
};

const operatorPrecedence: Record<Operator, number> = {
  '^': 3,
  '*': 2,
  '/': 2,
  '+': 1,
  '-': 1
};

const isOperatorToken = (token: Token | undefined, value: Operator): boolean =>
  Boolean(token && token.type === 'operator' && token.value === value);

const parseExpression = (expression: string): MathNode => {
  const tokens = tokenize(expression);
  if (!tokens.length) {
    throw new EvaluationError('Enter an expression to format.');
  }

  const parsePrimary = (index: number): [MathNode, number] => {
    const token = tokens[index];
    if (!token) {
      throw new EvaluationError('Incomplete expression.');
    }

    if (token.type === 'number') {
      return [
        { type: 'number', value: token.value },
        index + 1
      ];
    }

    if (token.type === 'paren' && token.value === '(') {
      const [child, nextIndex] = parseAddSub(index + 1);
      const closing = tokens[nextIndex];
      if (!(closing && closing.type === 'paren' && closing.value === ')')) {
        throw new EvaluationError('Mismatched parentheses detected.');
      }
      return [
        { type: 'group', child },
        nextIndex + 1
      ];
    }

    throw new EvaluationError('Unexpected character while formatting.');
  };

  const parseExponent = (index: number): [MathNode, number] => {
    const [base, nextIndex] = parsePrimary(index);
    if (isOperatorToken(tokens[nextIndex], '^')) {
      const [exponent, afterExponent] = parseExponent(nextIndex + 1);
      return [
        { type: 'binary', operator: '^', left: base, right: exponent },
        afterExponent
      ];
    }
    return [base, nextIndex];
  };

  const parseMulDiv = (index: number): [MathNode, number] => {
    let [node, nextIndex] = parseExponent(index);
    while (isOperatorToken(tokens[nextIndex], '*') || isOperatorToken(tokens[nextIndex], '/')) {
      const operator = (tokens[nextIndex] as Token & { type: 'operator' }).value;
      const [right, afterRight] = parseExponent(nextIndex + 1);
      node = { type: 'binary', operator, left: node, right };
      nextIndex = afterRight;
    }
    return [node, nextIndex];
  };

  const parseAddSub = (index: number): [MathNode, number] => {
    let [node, nextIndex] = parseMulDiv(index);
    while (isOperatorToken(tokens[nextIndex], '+') || isOperatorToken(tokens[nextIndex], '-')) {
      const operator = (tokens[nextIndex] as Token & { type: 'operator' }).value;
      const [right, afterRight] = parseMulDiv(nextIndex + 1);
      node = { type: 'binary', operator, left: node, right };
      nextIndex = afterRight;
    }
    return [node, nextIndex];
  };

  const [node, index] = parseAddSub(0);
  if (index !== tokens.length) {
    throw new EvaluationError('Unable to format the full expression.');
  }
  return node;
};

const needsParentheses = (child: MathNode, parentOperator: Operator, position: Position): boolean => {
  if (child.type !== 'binary') {
    return false;
  }
  const childPrecedence = operatorPrecedence[child.operator];
  const parentPrecedence = operatorPrecedence[parentOperator];
  if (childPrecedence < parentPrecedence) {
    return true;
  }

  if (parentOperator === '^' && position === 'right') {
    return true;
  }

  if ((parentOperator === '/' || parentOperator === '-') && position === 'right') {
    return childPrecedence <= parentPrecedence;
  }

  return false;
};

const getRootDegree = (exponent: MathNode): number | null => {
  const target = unwrapGroup(exponent);

  if (target.type === 'number') {
    if (target.value === 0.5 || target.value === 1 / 2) {
      return 2;
    }
    return null;
  }

  if (
    target.type === 'binary' &&
    target.operator === '/' &&
    target.left.type === 'number' &&
    target.left.value === 1 &&
    target.right.type === 'number'
  ) {
    const simplified = formatNumber(target.right.value);
    if (simplified > 0 && Number.isInteger(simplified)) {
      return simplified;
    }
  }

  return null;
};

const renderMathNode = (node: MathNode): JSX.Element => {
  if (node.type === 'number') {
    return <span className="math-number">{formatNumber(node.value)}</span>;
  }

  if (node.type === 'group') {
    return (
      <span className="math-group">
        <span className="math-parenthesis">(</span>
        {renderMathNode(node.child)}
        <span className="math-parenthesis">)</span>
      </span>
    );
  }

  const wrapChild = (child: MathNode, currentOperator: Operator, childPosition: Position) => {
    const content = renderMathNode(child);
    if (needsParentheses(child, currentOperator, childPosition)) {
      return (
        <span className="math-group">
          <span className="math-parenthesis">(</span>
          {content}
          <span className="math-parenthesis">)</span>
        </span>
      );
    }
    return content;
  };

  if (node.operator === '^') {
    const rootDegree = getRootDegree(node.right);
    const base = wrapChild(node.left, '^', 'left');

    if (rootDegree) {
      return (
        <span className="math-root">
          {rootDegree !== 2 ? <span className="math-root__index">{rootDegree}</span> : null}
          <span className="math-root__symbol" aria-hidden="true">
            √
          </span>
          <span className="math-root__radicand">{base}</span>
        </span>
      );
    }

    const exponent = wrapChild(node.right, '^', 'right');
    return (
      <span className="math-power">
        {base}
        <sup className="math-superscript">{exponent}</sup>
      </span>
    );
  }

  const left = wrapChild(node.left, node.operator, 'left');
  const right = wrapChild(node.right, node.operator, 'right');

  if (node.operator === '/') {
    return (
      <span className="math-fraction" role="presentation">
        <span className="math-fraction__numerator">{left}</span>
        <span className="math-fraction__bar" aria-hidden="true" />
        <span className="math-fraction__denominator">{right}</span>
      </span>
    );
  }

  const operatorSymbols: Record<Operator, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '^': '^'
  };

  const symbol = operatorSymbols[node.operator];

  return (
    <span className="math-binary" role="presentation">
      {left}
      <span className="math-operator" aria-hidden="true">
        {symbol}
      </span>
      {right}
    </span>
  );
};

const ExpressionNotation = ({ expression }: { expression: string }) => {
  const trimmedExpression = expression.trim();

  const parseResult: ParseResult = useMemo(() => {
    if (!trimmedExpression) {
      return { node: null, error: null };
    }
    try {
      const node = parseExpression(trimmedExpression);
      return { node, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to format this expression yet.';
      return { node: null, error: message };
    }
  }, [trimmedExpression]);

  return (
    <section className="notation-card" aria-live="polite">
      <header className="notation-card__header">
        <p className="notation-card__eyebrow">Mathematical notation</p>
        <p className="notation-card__hint">
          Read-only preview that mirrors your expression using formal symbols.
        </p>
      </header>
      {!trimmedExpression ? (
        <p className="notation-card__placeholder">Start typing to see the notation preview.</p>
      ) : parseResult.error ? (
        <p className="notation-card__error">{parseResult.error}</p>
      ) : (
        <div className="notation-card__preview" role="presentation">
          {parseResult.node ? renderMathNode(parseResult.node) : null}
        </div>
      )}
    </section>
  );
};

export default ExpressionNotation;
