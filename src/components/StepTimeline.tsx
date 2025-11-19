import type { ReactNode } from 'react';
import type { BodmasStep, OrderConvention, OrderRule } from '../lib/bodmas';
import { getRuleColor, getRuleLabel } from '../lib/bodmas';

interface Props {
  steps: BodmasStep[];
  emptyMessage?: string;
  convention?: OrderConvention;
}

const ORDER_RULES: OrderRule[] = [
  'grouping',
  'exponents',
  'multiplicationDivision',
  'additionSubtraction'
];

const humanizeLabel = (label: string): string => label.toLowerCase().replace('/', ' or ');

const formatRulePhrase = (rule: OrderRule, convention: OrderConvention): string =>
  humanizeLabel(getRuleLabel(rule, convention));

const formatSeries = (items: string[]): string => {
  if (items.length === 1) {
    return items[0];
  }
  if (items.length === 2) {
    return `${items[0]} or ${items[1]}`;
  }
  const head = items.slice(0, -1).join(', ');
  return `${head}, or ${items[items.length - 1]}`;
};

const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  if (sanitized.length !== 6) {
    return hex;
  }
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const renderOperationHighlight = (text: string, color: string): ReactNode => (
  <mark
    className="step-card__highlight"
    style={{
      color,
      backgroundColor: hexToRgba(color, 0.18),
      borderColor: color
    }}
  >
    {text}
  </mark>
);

const renderStepDescription = (
  step: BodmasStep,
  convention: OrderConvention,
  color: string
): ReactNode => {
  const groupingLabel = formatRulePhrase('grouping', convention);
  const operationHighlight = renderOperationHighlight(step.operation, color);
  const location = step.scope === 'group' ? 'inside this group' : 'in the expression';

  if (step.rule === 'grouping') {
    const prefix =
      step.scope === 'group'
        ? `Inside these ${groupingLabel} `
        : `Based on evaluating ${groupingLabel} from left to right `;
    return (
      <p className="step-card__description">
        {prefix}
        {operationHighlight}
        {' must be resolved.'}
      </p>
    );
  }

  if (step.rule === 'exponents') {
    const orderLabel = formatRulePhrase('exponents', convention);
    return (
      <p className="step-card__description">
        {`With ${groupingLabel} handled ${location}, we evaluate the ${orderLabel} `}
        {operationHighlight}
        {' next.'}
      </p>
    );
  }

  if (step.rule === 'multiplicationDivision') {
    const prerequisites = formatSeries([
      groupingLabel,
      formatRulePhrase('exponents', convention)
    ]);
    const action = step.operator === '/' ? 'division' : 'multiplication';
    return (
      <p className="step-card__description">
        {`There are no ${prerequisites} ${location}, so the next operation is the ${action} `}
        {operationHighlight}
        {'.'}
      </p>
    );
  }

  const prerequisites = formatSeries([
    groupingLabel,
    formatRulePhrase('exponents', convention),
    formatRulePhrase('multiplicationDivision', convention)
  ]);
  const action = step.operator === '-' ? 'subtraction' : 'addition';
  return (
    <p className="step-card__description">
      {`There are no ${prerequisites} ${location}, so the only operation left is ${action} and we evaluate `}
      {operationHighlight}
      {' now.'}
    </p>
  );
};

const highlightSegment = (text: string, target: string, color: string): ReactNode => {
  if (!target.trim()) {
    return text;
  }
  const index = text.indexOf(target);
  if (index === -1) {
    return text;
  }
  const before = text.slice(0, index);
  const highlighted = text.slice(index, index + target.length);
  const after = text.slice(index + target.length);
  return (
    <>
      {before}
      <mark
        className="step-card__highlight"
        style={{
          color,
          backgroundColor: hexToRgba(color, 0.18),
          borderColor: color
        }}
      >
        {highlighted}
      </mark>
      {after}
    </>
  );
};

const StepTimeline = ({
  steps,
  convention = 'bodmas',
  emptyMessage = 'No steps yet. Start by evaluating an expression.'
}: Props) => {
  const renderSteps = (stepList: BodmasStep[], level = 0): ReactNode => {
    const listClassName = level === 0 ? 'timeline' : 'timeline timeline--nested';
    return (
      <ol className={listClassName}>
        {stepList.map((step, index) => {
          const nestingLevel = Math.max(0, step.depth || 0);
          const offset =
            level === 0 && nestingLevel ? `${nestingLevel * 0.6}rem` : undefined;
          const stepLabel = level === 0 ? `Step ${index + 1}` : `Nested step ${index + 1}`;

          const ruleColor = getRuleColor(step.rule);
          return (
            <li key={`${step.id}-${level}-${index}`} className="timeline-item">
              <article
                className={`step-card${level ? ' step-card--nested' : ''}`}
                style={{
                  borderColor: ruleColor,
                  marginLeft: offset
                }}
              >
                <header className="step-card__header">
                  <div className="step-card__meta">
                    <span className="step-card__index">{stepLabel}</span>
                  </div>
                  <div className="step-card__rules">
                    {ORDER_RULES.map((orderRule) => {
                      const isActive = orderRule === step.rule;
                      return (
                        <span
                          key={`${step.id}-${orderRule}`}
                          className={`step-card__rule${isActive ? '' : ' step-card__rule--inactive'}`}
                          style={isActive ? { backgroundColor: getRuleColor(orderRule) } : undefined}
                        >
                          {getRuleLabel(orderRule, convention)}
                        </span>
                      );
                    })}
                  </div>
                </header>
                {renderStepDescription(step, convention, ruleColor)}
                <div className="step-card__work">
                  <div className="step-card__expression-block" aria-label="expression before step">
                    <code>
                      {highlightSegment(step.before, step.operation, ruleColor)}
                    </code>
                  </div>
                  <span className="step-card__arrow" aria-hidden="true">
                    =
                  </span>
                  <div className="step-card__expression-block" aria-label="expression after step">
                    <code>
                      {highlightSegment(step.after, step.result.toString(), ruleColor)}
                    </code>
                  </div>
                </div>
                {step.children?.length ? (
                  <div className="step-card__nested">
                    <span className="step-card__nested-label">Nested steps</span>
                    {renderSteps(step.children, level + 1)}
                  </div>
                ) : null}
              </article>
            </li>
          );
        })}
      </ol>
    );
  };

  if (!steps.length) {
    return <p className="timeline-empty">{emptyMessage}</p>;
  }

  return renderSteps(steps);
};

export default StepTimeline;
