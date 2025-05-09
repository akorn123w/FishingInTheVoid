import type { SquidExpression } from '@/types/game';

export interface SquidFormProps {
    isBlinking?: boolean;
    isHappy?: boolean;
    expression?: SquidExpression;
    scale?: number;
}