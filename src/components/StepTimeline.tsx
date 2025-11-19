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
      {steps.map((step, index) => (
        <li key={step.id} className="timeline-item">
          <article className="step-card" style={{ borderColor: getRuleColor(step.rule) }}>
            <header className="step-card__header">
              <span className="step-card__index">Step {index + 1}</span>
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
            <footer className="step-card__footer">
              <span className="step-card__footer-label">Resolved</span>
              <div className="step-card__resolution" style={{ color: getRuleColor(step.rule) }}>
                <code>{step.operation}</code>
                <span aria-hidden="true">=</span>
                <strong>{step.result}</strong>
              </div>
            </footer>
          </article>
        </li>
      ))}
    </ol>
  );
};

export default StepTimeline;
