import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import StepTimeline from './StepTimeline';
import { evaluateExpression, EvaluationError } from '../lib/bodmas';
const starterExamples = ['7 + 3 * (6 - 4)', '12 / (2 + 1) + 3', '2 ^ 3 + 4', '6 + 4 / 2'];
const ExpressionVisualizer = () => {
    const [expression, setExpression] = useState(starterExamples[0]);
    const [steps, setSteps] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const runEvaluation = (value) => {
        try {
            const evaluation = evaluateExpression(value);
            setSteps(evaluation.steps);
            setResult(evaluation.value);
            setError(null);
        }
        catch (err) {
            if (err instanceof EvaluationError) {
                setError(err.message);
            }
            else {
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
    const handleSubmit = (event) => {
        event.preventDefault();
        runEvaluation(expression);
    };
    const handleUseExample = (value) => {
        setExpression(value);
        runEvaluation(value);
    };
    return (_jsxs("section", { className: "panel expression-panel", children: [_jsx("header", { className: "panel__header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Expression explorer" }), _jsx("h2", { children: "Visualise the order of operations" }), _jsx("p", { children: "Enter any expression to view each BODMAS step, colour-coded by rule." })] }) }), _jsxs("form", { className: "expression-form", onSubmit: handleSubmit, children: [_jsx("label", { htmlFor: "expression-input", className: "sr-only", children: "Expression" }), _jsx("textarea", { id: "expression-input", className: "expression-input", value: expression, onChange: (event) => setExpression(event.target.value), rows: 2, spellCheck: false }), _jsxs("div", { className: "expression-form__actions", children: [_jsx("button", { type: "submit", className: "primary-button", children: "Evaluate" }), _jsx("div", { className: "example-chips", "aria-label": "Example expressions", children: starterExamples.map((example) => (_jsx("button", { type: "button", onClick: () => handleUseExample(example), className: example === expression ? 'chip chip--active' : 'chip', children: example }, example))) })] })] }), error ? (_jsx("p", { role: "alert", className: "error-text", children: error })) : (_jsxs("div", { className: "result-callout", children: [_jsx("span", { children: "Result" }), _jsx("strong", { children: result ?? '–' })] })), _jsx(StepTimeline, { steps: steps })] }));
};
export default ExpressionVisualizer;
