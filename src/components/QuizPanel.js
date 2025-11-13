import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import StepTimeline from './StepTimeline';
import presets from '../data/quizzes/presets.json';
import { evaluateExpression } from '../lib/bodmas';
const shuffle = (values) => {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};
const buildQuestion = () => {
    const expression = presets[Math.floor(Math.random() * presets.length)];
    try {
        const evaluation = evaluateExpression(expression);
        const distractors = new Set();
        while (distractors.size < 3) {
            const offset = Math.floor(Math.random() * 7) - 3; // -3..3
            const candidate = evaluation.value + offset;
            if (candidate !== evaluation.value) {
                distractors.add(candidate);
            }
        }
        const options = shuffle([evaluation.value, ...distractors]);
        return { expression, answer: evaluation.value, steps: evaluation.steps, options };
    }
    catch (error) {
        const fallbackValue = 0;
        return { expression, answer: fallbackValue, steps: [], options: [fallbackValue] };
    }
};
const QuizPanel = () => {
    const [question, setQuestion] = useState(() => buildQuestion());
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const handleSelect = (value) => {
        if (status !== 'idle') {
            return;
        }
        setSelected(value);
        if (value === question.answer) {
            setStatus('correct');
            setError(null);
        }
        else {
            setStatus('incorrect');
            setError('Take another look at the diagram or try a new question.');
        }
    };
    const handleNext = () => {
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
    return (_jsxs("section", { className: "panel quiz-panel", children: [_jsx("header", { className: "panel__header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Quiz mode" }), _jsx("h2", { children: "Test your BODMAS instincts" }), _jsx("p", { children: "Pick the correct solution, then inspect the working to stay sharp." })] }) }), _jsxs("div", { className: "quiz-expression", children: [_jsx("span", { children: "Expression" }), _jsx("strong", { children: question.expression })] }), _jsx("div", { className: "quiz-options", role: "list", children: question.options.map((option) => {
                    const isSelected = option === selected;
                    const isCorrect = status !== 'idle' && option === question.answer;
                    return (_jsx("button", { type: "button", role: "listitem", className: `quiz-option ${isSelected ? 'quiz-option--selected' : ''} ${isCorrect ? 'quiz-option--correct' : ''}`, onClick: () => handleSelect(option), disabled: status !== 'idle', children: option }, option));
                }) }), _jsx("p", { className: `quiz-feedback quiz-feedback--${status}`, children: feedback }), error && _jsx("p", { className: "quiz-error", children: error }), _jsx("div", { className: "quiz-actions", children: _jsx("button", { type: "button", className: "secondary-button", onClick: handleNext, children: "Next Question" }) }), status !== 'idle' && (_jsxs("div", { className: "quiz-solution", children: [_jsx("h3", { children: "Solution steps" }), _jsx(StepTimeline, { steps: question.steps, emptyMessage: "Steps unavailable for this expression." })] }))] }));
};
export default QuizPanel;
