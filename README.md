# Order of Operations Tutor

This app visualises and quizzes learners on the correct order of operations for arithmetic expressions. You can switch between the most common mnemonics—BODMAS, BIRDMAS, and PEMDAS—and watch each step relabel itself to match your classroom terminology.

## Features
- Interactive expression explorer with colour-coded evaluation steps.
- Notation picker that toggles BODMAS, BIRDMAS, and PEMDAS labels without changing the underlying maths.
- Quiz mode with multiple-choice answers and a forced attempt flow so students cannot skip ahead without selecting an answer.
- Step-by-step breakdowns for every generated quiz expression to reinforce the rules used.

## Getting Started
1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. Run the automated tests: `npm run test`

## Learning with Different Notations
Regardless of the mnemonic you prefer, the evaluator follows the same precedence:
1. Grouping symbols (parentheses or brackets)
2. Exponents, indices, or roots
3. Multiplication and division (left to right)
4. Addition and subtraction (left to right)

Pick your notation in the header to see each step labelled accordingly while keeping the computation consistent.
