import { useMemo, useState } from 'react';
import StepTimeline from './StepTimeline';
import { generateQuestion, type Difficulty } from '../lib/quiz-generator';
import type { OrderConvention } from '../lib/bodmas';

type Score = {
  correct: number;
  incorrect: number;
};

interface Props {
  convention: OrderConvention;
}

const QuizPanel = ({ convention }: Props) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [question, setQuestion] = useState(() => generateQuestion('medium'));
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<Score>({ correct: 0, incorrect: 0 });

  const difficultyOptions: Array<{ value: Difficulty; label: string; description: string }> = [
    { value: 'easy', label: 'Easy', description: 'Straightforward addition & multiplication' },
    { value: 'medium', label: 'Medium', description: 'Parentheses and mixed operations' },
    { value: 'hard', label: 'Hard', description: 'Orders plus complex combinations' },
    {
      value: 'insane',
      label: 'Insane',
      description: 'Layered parentheses, exponents, and division twists'
    }
  ];

  const handleSelect = (value: number): void => {
    if (status !== 'idle') {
      return;
    }
    setSelected(value);
    if (value === question.answer) {
      setStatus('correct');
      setError(null);
      setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStatus('incorrect');
      setError('Take another look at the diagram or try a new question.');
      setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
  };

  const handleNext = (): void => {
    if (status === 'idle') {
      return;
    }
    setQuestion(generateQuestion(difficulty));
    setSelected(null);
    setStatus('idle');
    setError(null);
  };

  const handleDifficultyChange = (value: Difficulty): void => {
    setDifficulty(value);
    setQuestion(generateQuestion(value));
    setSelected(null);
    setStatus('idle');
    setError(null);
  };

  const handleResetScore = (): void => {
    setScore({ correct: 0, incorrect: 0 });
  };

  const feedback = useMemo(() => {
    if (status === 'correct') {
      return 'Great job! You applied the order of operations correctly.';
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
          <h2>Test your order of operations instincts</h2>
          <p>
            Pick the correct solution, then inspect the working to compare BODMAS, BIRDMAS, and
            PEMDAS phrasing.
          </p>
        </div>
      </header>

      <div className="quiz-controls">
        <div className="difficulty-controls">
          <p className="eyebrow">Difficulty</p>
          <div className="difficulty-toggle" role="group" aria-label="Select difficulty">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`difficulty-button ${
                  option.value === difficulty ? 'difficulty-button--active' : ''
                }`}
                onClick={() => handleDifficultyChange(option.value)}
              >
                <span className="difficulty-button__label">{option.label}</span>
                <span className="difficulty-button__description">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-score" aria-live="polite">
          <div>
            <span>Correct</span>
            <strong>{score.correct}</strong>
          </div>
          <div>
            <span>Incorrect</span>
            <strong>{score.incorrect}</strong>
          </div>
          <button type="button" className="chip" onClick={handleResetScore}>
            Reset
          </button>
        </div>
      </div>

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
        <button
          type="button"
          className="secondary-button"
          onClick={handleNext}
          disabled={status === 'idle'}
        >
          Next Question
        </button>
      </div>

      {status !== 'idle' && (
        <div className="quiz-solution">
          <h3>Solution steps</h3>
          <StepTimeline
            steps={question.steps}
            emptyMessage="Steps unavailable for this expression."
            convention={convention}
          />
        </div>
      )}
    </section>
  );
};

export default QuizPanel;
