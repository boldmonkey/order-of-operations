import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getRuleColor } from '../lib/bodmas';
const StepTimeline = ({ steps, emptyMessage = 'No steps yet. Start by evaluating an expression.' }) => {
    if (!steps.length) {
        return _jsx("p", { className: "timeline-empty", children: emptyMessage });
    }
    return (_jsx("ol", { className: "timeline", children: steps.map((step, index) => (_jsx("li", { className: "timeline-item", children: _jsxs("article", { className: "step-card", style: { borderColor: getRuleColor(step.rule) }, children: [_jsxs("header", { className: "step-card__header", children: [_jsxs("span", { className: "step-card__index", children: ["Step ", index + 1] }), _jsx("span", { className: "step-card__rule", style: { backgroundColor: getRuleColor(step.rule) }, children: step.rule })] }), _jsx("p", { className: "step-card__description", children: step.description }), _jsxs("div", { className: "step-card__expression", children: [_jsx("code", { children: step.before }), _jsx("span", { "aria-hidden": "true", children: "\u2192" }), _jsx("code", { children: step.after })] }), _jsxs("footer", { className: "step-card__footer", children: [_jsxs("span", { children: ["Resolved ", step.operation] }), _jsxs("strong", { children: ["= ", step.result] })] })] }) }, step.id))) }));
};
export default StepTimeline;
