import type { BodmasStep } from '../lib/bodmas';
import { getRuleColor } from '../lib/bodmas';

interface Props {
  steps: BodmasStep[];
  emptyMessage?: string;
}

const StepTimeline = ({ steps, emptyMessage = 'No steps yet. Start by evaluating an expression.' }: Props) => {
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
                {step.rule}
              </span>
            </header>
            <p className="step-card__description">{step.description}</p>
            <div className="step-card__expression">
              <code>{step.before}</code>
              <span aria-hidden="true">→</span>
              <code>{step.after}</code>
            </div>
            <footer className="step-card__footer">
              <span>Resolved {step.operation}</span>
              <strong>= {step.result}</strong>
            </footer>
          </article>
        </li>
      ))}
    </ol>
  );
};

export default StepTimeline;
