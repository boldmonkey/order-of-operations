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
          <ExpressionVisualizer
            convention={convention}
            onConventionChange={(value) => setConvention(value)}
          />
        )}
      </section>
    </main>
  );
};

export default App;
