import { useMemo, useState } from 'react';
import StepTimeline from './StepTimeline';
import presets from '../data/quizzes/presets.json';
import { evaluateExpression, type BodmasStep } from '../lib/bodmas';

type QuizQuestion = {
  expression: string;
  answer: number;
  options: number[];
  steps: BodmasStep[];
};

const shuffle = <T,>(values: T[]): T[] => {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildQuestion = (): QuizQuestion => {
  const expression = presets[Math.floor(Math.random() * presets.length)];
  try {
    const evaluation = evaluateExpression(expression);
    const distractors = new Set<number>();
    while (distractors.size < 3) {
      const offset = Math.floor(Math.random() * 7) - 3; // -3..3
      const candidate = evaluation.value + offset;
      if (candidate !== evaluation.value) {
        distractors.add(candidate);
      }
    }
    const options = shuffle([evaluation.value, ...distractors]);
    return { expression, answer: evaluation.value, steps: evaluation.steps, options };
  } catch (error) {
    const fallbackValue = 0;
    return { expression, answer: fallbackValue, steps: [], options: [fallbackValue] };
  }
};

const QuizPanel = () => {
  const [question, setQuestion] = useState<QuizQuestion>(() => buildQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (value: number): void => {
    if (status !== 'idle') {
      return;
    }
    setSelected(value);
    if (value === question.answer) {
      setStatus('correct');
      setError(null);
    } else {
      setStatus('incorrect');
      setError('Take another look at the diagram or try a new question.');
    }
  };

  const handleNext = (): void => {
    setQuestion(buildQuestion());
    setSelected(null);
    setStatus('idle');
    setError(null);
  };

  const feedback = useMemo(() => {
    if (status === 'correct') {
      return 'Great job! You applied BODMAS correctly.';
    }
    if (status === 'incorrect') {
      return 'Not quite. Review the highlighted steps below.';
    }
    return 'Select the correct evaluation from the options.';
  }, [status]);

  return (
    <section className="panel quiz-panel">
      <header className="panel__header">
        <div>
          <p className="eyebrow">Quiz mode</p>
          <h2>Test your BODMAS instincts</h2>
          <p>Pick the correct solution, then inspect the working to stay sharp.</p>
        </div>
      </header>

      <div className="quiz-expression">
        <span>Expression</span>
        <strong>{question.expression}</strong>
      </div>

      <div className="quiz-options" role="list">
        {question.options.map((option) => {
          const isSelected = option === selected;
          const isCorrect = status !== 'idle' && option === question.answer;
          return (
            <button
              key={option}
              type="button"
              role="listitem"
              className={`quiz-option ${isSelected ? 'quiz-option--selected' : ''} ${
                isCorrect ? 'quiz-option--correct' : ''
              }`}
              onClick={() => handleSelect(option)}
              disabled={status !== 'idle'}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p className={`quiz-feedback quiz-feedback--${status}`}>{feedback}</p>
      {error && <p className="quiz-error">{error}</p>}

      <div className="quiz-actions">
        <button type="button" className="secondary-button" onClick={handleNext}>
          Next Question
        </button>
      </div>

      {status !== 'idle' && (
        <div className="quiz-solution">
          <h3>Solution steps</h3>
          <StepTimeline
            steps={question.steps}
            emptyMessage="Steps unavailable for this expression."
          />
        </div>
      )}
    </section>
  );
};

export default QuizPanel;
