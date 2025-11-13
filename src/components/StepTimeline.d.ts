import type { BodmasStep } from '../lib/bodmas';
interface Props {
    steps: BodmasStep[];
    emptyMessage?: string;
}
declare const StepTimeline: ({ steps, emptyMessage }: Props) => import("react/jsx-runtime").JSX.Element;
export default StepTimeline;
