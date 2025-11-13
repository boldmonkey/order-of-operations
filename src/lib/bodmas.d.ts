export type BodmasRule = 'Brackets' | 'Orders' | 'Multiply/Divide' | 'Add/Subtract';
export interface BodmasStep {
    id: string;
    rule: BodmasRule;
    before: string;
    after: string;
    operation: string;
    result: number;
    description: string;
}
export declare const getRuleColor: (rule: BodmasRule) => string;
export interface EvaluationResult {
    value: number;
    steps: BodmasStep[];
}
export declare class EvaluationError extends Error {
}
export declare const evaluateExpression: (expression: string) => EvaluationResult;
