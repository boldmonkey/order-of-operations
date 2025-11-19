import { FormEvent, useEffect, useState } from 'react';
import StepTimeline from './StepTimeline';
import {
  evaluateExpression,
  EvaluationError,
  getRuleColor,
  type BodmasStep,
  type OrderConvention,
  type OrderRule
} from '../lib/bodmas';

const starterExamples = ['7 + 3 * (6 - 4)', '12 / (2 + 1) + 3', '2 ^ 3 + 4', '6 + 4 / 2'];
type NotationOption = {
  value: OrderConvention;
  helper: string;
  segments: Array<{ text: string; rule: OrderRule }>;
};

const notationOptions: NotationOption[] = [
  {
    value: 'bodmas',
    helper: 'Brackets, Orders, Division/Multiplication',
    segments: [
      { text: 'B', rule: 'grouping' },
      { text: 'O', rule: 'exponents' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  },
  {
    value: 'birdmas',
    helper: 'Brackets, Indices/Roots, Division/Multiplication',
    segments: [
      { text: 'B', rule: 'grouping' },
      { text: 'I', rule: 'exponents' },
      { text: 'R', rule: 'exponents' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  },
  {
    value: 'pemdas',
    helper: 'Parentheses, Exponents, Multiplication/Division',
    segments: [
      { text: 'P', rule: 'grouping' },
      { text: 'E', rule: 'exponents' },
      { text: 'M', rule: 'multiplicationDivision' },
      { text: 'D', rule: 'multiplicationDivision' },
      { text: 'A', rule: 'additionSubtraction' },
      { text: 'S', rule: 'additionSubtraction' }
    ]
  }
];

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
        <div className="convention-switcher">
          <span className="convention-switcher__label">Notation</span>
          <div className="convention-toggle" role="radiogroup" aria-label="Choose notation mnemonic">
            {notationOptions.map((option) => (
              <label
                key={option.value}
                className={`convention-option ${
                  convention === option.value ? 'convention-option--active' : ''
                }`}
                title={option.helper}
              >
                <input
                  type="radio"
                  name="notation"
                  value={option.value}
                  checked={convention === option.value}
                  onChange={() => onConventionChange(option.value)}
                />
                <span className="convention-option__label" aria-hidden="true">
                  {option.segments.map((segment, idx) => (
                    <span
                      key={`${option.value}-${segment.text}-${idx}`}
                      className="convention-option__segment"
                      style={{ color: getRuleColor(segment.rule) }}
                    >
                      {segment.text}
                    </span>
                  ))}
                </span>
                <span className="sr-only">{option.helper}</span>
              </label>
            ))}
          </div>
        </div>
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
