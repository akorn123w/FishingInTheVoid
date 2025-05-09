import type { SquidExpression } from '@/types/game';

export interface SquidFormProps {
    isBlinking?: boolean;
    isHappy?: boolean;
    expression?: 'content' | 'trying' | 'eating';
    scale?: number;
}