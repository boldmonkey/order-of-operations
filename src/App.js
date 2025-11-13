import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ExpressionVisualizer from './components/ExpressionVisualizer';
import QuizPanel from './components/QuizPanel';
import './App.css';
const App = () => {
    return (_jsxs("main", { className: "app-shell", children: [_jsxs("header", { className: "app-header", children: [_jsx("p", { className: "eyebrow", children: "Order of Operations Tutor" }), _jsx("h1", { children: "Master BODMAS with visuals and quizzes" }), _jsx("p", { children: "Type an expression to watch each rule in action, then switch to quiz mode to reinforce the process with instant feedback." })] }), _jsxs("div", { className: "grid", children: [_jsx(ExpressionVisualizer, {}), _jsx(QuizPanel, {})] })] }));
};
export default App;
