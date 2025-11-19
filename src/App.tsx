import { useState } from 'react';
import ExpressionVisualizer from './components/ExpressionVisualizer';
import QuizPanel from './components/QuizPanel';
import type { OrderConvention } from './lib/bodmas';
import './App.css';

type TabId = 'visualizer' | 'quiz';

const App = () => {
  const [activeTab, setActiveTab] = useState<TabId>('visualizer');
  const [convention, setConvention] = useState<OrderConvention>('bodmas');

  const tabs: Array<{ id: TabId; label: string; description: string }> = [
    {
      id: 'visualizer',
      label: 'Explore',
      description: 'Visualise expressions with colour-coded steps.'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      description: 'Test your instincts with multiple-choice challenges.'
    }
  ];

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Order of Operations Tutor</p>
        <h1>Master the order of operations with visuals and quizzes</h1>
        <p>
          Type an expression to watch each rule in action, then switch to quiz mode to reinforce
          the process with instant feedback.
        </p>

        <div className="notation-selector">
          <div>
            <p className="eyebrow">Notation</p>
            <p className="notation-selector__description">
              Choose the mnemonic you use locally—BODMAS, BIRDMAS, or PEMDAS—and we will label
              each step to match.
            </p>
          </div>
          <div className="notation-toggle" role="group" aria-label="Choose notation mnemonic">
            {(
              [
                { value: 'bodmas', label: 'BODMAS', helper: 'Brackets, Orders, Division/Multiplication' },
                { value: 'birdmas', label: 'BIRDMAS', helper: 'Brackets, Indices/Roots, Division/Multiplication' },
                { value: 'pemdas', label: 'PEMDAS', helper: 'Parentheses, Exponents, Multiplication/Division' }
              ] as Array<{ value: OrderConvention; label: string; helper: string }>
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                className={`notation-button ${
                  convention === option.value ? 'notation-button--active' : ''
                }`}
                onClick={() => setConvention(option.value)}
              >
                <span className="notation-button__label">{option.label}</span>
                <span className="notation-button__helper">{option.helper}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Learning modes">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${tab.id}-tab`}
            aria-controls={`${tab.id}-panel`}
            aria-selected={tab.id === activeTab}
            className={`tab ${tab.id === activeTab ? 'tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab__label">{tab.label}</span>
            <span className="tab__description">{tab.description}</span>
          </button>
        ))}
      </nav>

      <section
        className="tab-panel"
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        {activeTab === 'quiz' ? (
          <QuizPanel convention={convention} />
        ) : (
          <ExpressionVisualizer convention={convention} />
        )}
      </section>
    </main>
  );
};

export default App;
