import type { ReactNode } from 'react';
import type { BodmasStep, OrderConvention } from '../lib/bodmas';
import { getRuleColor, getRuleLabel } from '../lib/bodmas';

interface Props {
  steps: BodmasStep[];
  emptyMessage?: string;
  convention?: OrderConvention;
}

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
  if (!steps.length) {
    return <p className="timeline-empty">{emptyMessage}</p>;
  }

  return (
    <ol className="timeline">
      {steps.map((step, index) => {
        const nestingLevel = Math.max(0, step.depth || 0);
        const nestingLabel =
          nestingLevel === 0
            ? 'Top-level step'
            : `Inside ${nestingLevel} bracket level${nestingLevel > 1 ? 's' : ''}`;
        const nestingHighlight = highlightSegment(
          step.before,
          step.operation,
          getRuleColor(step.rule)
        );

        return (
          <li key={step.id} className="timeline-item">
            <article
              className="step-card"
              style={{
                borderColor: getRuleColor(step.rule),
                marginLeft: nestingLevel ? `${nestingLevel * 0.6}rem` : undefined
              }}
            >
              <header className="step-card__header">
                <div className="step-card__meta">
                  <span className="step-card__index">Step {index + 1}</span>
                  {nestingLevel > 0 && (
                    <span className="step-card__nesting" aria-label={nestingLabel}>
                      <span className="step-card__nesting-label">Nested level {nestingLevel}</span>
                      <code className="step-card__nesting-expression">{nestingHighlight}</code>
                    </span>
                  )}
                </div>
                <span
                  className="step-card__rule"
                  style={{ backgroundColor: getRuleColor(step.rule) }}
                >
                  {getRuleLabel(step.rule, convention)}
                </span>
              </header>
              <p className="step-card__description">{step.description}</p>
              <div className="step-card__work">
                <div className="step-card__expression-block" aria-label="expression before step">
                  <span className="step-card__label">Before</span>
                  <code>
                    {highlightSegment(step.before, step.operation, getRuleColor(step.rule))}
                  </code>
                </div>
                <span className="step-card__arrow" aria-hidden="true">
                  →
                </span>
                <div className="step-card__expression-block" aria-label="expression after step">
                  <span className="step-card__label">After</span>
                  <code>
                    {highlightSegment(step.after, step.result.toString(), getRuleColor(step.rule))}
                  </code>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
};

export default StepTimeline;
