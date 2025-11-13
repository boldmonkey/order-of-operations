import ExpressionVisualizer from './components/ExpressionVisualizer';
import QuizPanel from './components/QuizPanel';
import './App.css';

const App = () => {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Order of Operations Tutor</p>
        <h1>Master BODMAS with visuals and quizzes</h1>
        <p>
          Type an expression to watch each rule in action, then switch to quiz mode to reinforce
          the process with instant feedback.
        </p>
      </header>

      <div className="grid">
        <ExpressionVisualizer />
        <QuizPanel />
      </div>
    </main>
  );
};

export default App;
