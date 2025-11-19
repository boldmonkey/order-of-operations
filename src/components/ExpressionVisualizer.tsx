import { FormEvent, useEffect, useState } from 'react';
import ConventionToggle from './ConventionToggle';
import StepTimeline from './StepTimeline';
import {
  evaluateExpression,
  EvaluationError,
  type BodmasStep,
  type OrderConvention
} from '../lib/bodmas';

const starterExamples = ['7 + 3 * (6 - 4)', '12 / (2 + 1) + 3', '2 ^ 3 + 4', '6 + 4 / 2'];

interface Props {
  convention: OrderConvention;
  onConventionChange: (value: OrderConvention) => void;
}

const ExpressionVisualizer = ({ convention, onConventionChange }: Props) => {
  const [expression, setExpression] = useState(starterExamples[0]);
  const [steps, setSteps] = useState<BodmasStep[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = (value: string): void => {
    try {
      const evaluation = evaluateExpression(value);
      setSteps(evaluation.steps);
      setResult(evaluation.value);
      setError(null);
    } catch (err) {
      if (err instanceof EvaluationError) {
        setError(err.message);
      } else {
        setError('Unable to process expression.');
      }
      setSteps([]);
      setResult(null);
    }
  };

  useEffect(() => {
    runEvaluation(expression);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    runEvaluation(expression);
  };

  const handleUseExample = (value: string): void => {
    setExpression(value);
    runEvaluation(value);
  };

  return (
    <section className="panel expression-panel">
      <header className="panel__header expression-panel__header">
        <div className="expression-panel__intro">
          <p className="eyebrow">Expression explorer</p>
          <h2>Visualise the order of operations</h2>
          <p>
            Enter any expression to see every step of the correct order of operations, labelled
            for your chosen convention.
          </p>
        </div>
        <ConventionToggle
          convention={convention}
          onChange={onConventionChange}
          ariaLabel="Choose notation mnemonic"
        />
      </header>

      <form className="expression-form" onSubmit={handleSubmit}>
        <label htmlFor="expression-input" className="sr-only">
          Expression
        </label>
        <textarea
          id="expression-input"
          className="expression-input"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          rows={2}
          spellCheck={false}
        />
        <div className="expression-form__actions">
          <button type="submit" className="primary-button">
            Evaluate
          </button>
          <div className="example-chips" aria-label="Example expressions">
            {starterExamples.map((example) => (
              <button
                type="button"
                key={example}
                onClick={() => handleUseExample(example)}
                className={example === expression ? 'chip chip--active' : 'chip'}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </form>

      {error ? (
        <p role="alert" className="error-text">
          {error}
        </p>
      ) : (
        <div className="result-callout">
          <span>Result</span>
          <strong>{result ?? '–'}</strong>
        </div>
      )}

      <StepTimeline steps={steps} convention={convention} />
    </section>
  );
};

export default ExpressionVisualizer;
