import { nanoid } from '../utils/nanoid';
const ruleDescriptions = {
    Brackets: 'Work through grouped expressions first.',
    Orders: 'Resolve exponents (powers or roots).',
    'Multiply/Divide': 'Handle multiplication or division before addition/subtraction.',
    'Add/Subtract': 'Finish with addition or subtraction.'
};
const ruleColors = {
    Brackets: '#5e81ac',
    Orders: '#bf616a',
    'Multiply/Divide': '#ebcb8b',
    'Add/Subtract': '#a3be8c'
};
export const getRuleColor = (rule) => ruleColors[rule];
export class EvaluationError extends Error {
}
const formatNumber = (value) => {
    const rounded = Number(parseFloat(value.toFixed(6)));
    return Number.isInteger(rounded) ? Math.trunc(rounded) : rounded;
};
const isDigit = (char) => /[0-9]/.test(char);
const isOperator = (value) => '^*/+-'.includes(value);
const tokenize = (expression) => {
    const tokens = [];
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
            if (char === '-' &&
                (!prev || prev.type === 'operator' || (prev.type === 'paren' && prev.value === '('))) {
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
const tokensToString = (tokens) => tokens
    .map((token) => {
    if (token.type === 'number') {
        return formatNumber(token.value).toString();
    }
    return token.value;
})
    .join(' ');
const compute = (left, operator, right) => {
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
const applyBinaryOperator = (tokens, operator, rule, steps, descriptionOverride, iterateReverse = false, contextRule) => {
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
        const finalRule = contextRule ?? rule;
        const description = contextRule != null
            ? ruleDescriptions[contextRule]
            : descriptionOverride ?? ruleDescriptions[rule];
        steps.push({
            id: nanoid(),
            rule: finalRule,
            before,
            after,
            operation: tokensToString(operationTokens),
            result: resultValue,
            description
        });
    }
};
const evaluateTokens = (inputTokens, contextRule) => {
    const tokens = inputTokens.map((token) => ({ ...token }));
    const steps = [];
    const resolveParentheses = () => {
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
            const innerResult = evaluateTokens(innerTokens, 'Brackets');
            steps.push(...innerResult.steps);
            const before = tokensToString(tokens);
            const insideExpr = tokensToString(innerTokens);
            tokens.splice(openIndex, closeIndex - openIndex + 1, {
                type: 'number',
                value: innerResult.value
            });
            const after = tokensToString(tokens);
            steps.push({
                id: nanoid(),
                rule: 'Brackets',
                before,
                after,
                operation: `(${insideExpr})`,
                result: innerResult.value,
                description: ruleDescriptions.Brackets
            });
            closeIndex = tokens.findIndex((token) => token.type === 'paren' && token.value === ')');
        }
        if (tokens.some((token) => token.type === 'paren')) {
            throw new EvaluationError('Mismatched parentheses detected.');
        }
    };
    const resolveOrders = () => {
        applyBinaryOperator(tokens, '^', 'Orders', steps, ruleDescriptions.Orders, true, contextRule);
    };
    const resolveMultiplicationDivision = () => {
        let hasMulOrDiv = tokens.some((token) => token.type === 'operator' && (token.value === '*' || token.value === '/'));
        while (hasMulOrDiv) {
            const index = tokens.findIndex((token) => token.type === 'operator' && (token.value === '*' || token.value === '/'));
            if (index === -1) {
                break;
            }
            const op = tokens[index];
            applyBinaryOperator(tokens, op.value, 'Multiply/Divide', steps, undefined, false, contextRule);
            hasMulOrDiv = tokens.some((token) => token.type === 'operator' && (token.value === '*' || token.value === '/'));
        }
    };
    const resolveAdditionSubtraction = () => {
        let hasAddOrSub = tokens.some((token) => token.type === 'operator' && (token.value === '+' || token.value === '-'));
        while (hasAddOrSub) {
            const index = tokens.findIndex((token) => token.type === 'operator' && (token.value === '+' || token.value === '-'));
            if (index === -1) {
                break;
            }
            const op = tokens[index];
            applyBinaryOperator(tokens, op.value, 'Add/Subtract', steps, undefined, false, contextRule);
            hasAddOrSub = tokens.some((token) => token.type === 'operator' && (token.value === '+' || token.value === '-'));
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
export const evaluateExpression = (expression) => {
    if (!expression.trim()) {
        throw new EvaluationError('Enter an expression to evaluate.');
    }
    const tokens = tokenize(expression);
    if (tokens.length === 0) {
        throw new EvaluationError('Nothing to evaluate.');
    }
    return evaluateTokens(tokens);
};
