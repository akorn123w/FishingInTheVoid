import { Position, SquidExpression } from '@/types/base';
import { FoodParticle } from '@/components/FoodParticle/types';
import { BaseParticle } from '@/types/base';

export interface FloatingNumber {
    id: number;
    x: number;
    y: number;
    value: number;
    opacity: number;
}

export interface Cell {
    id: number;
    type: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    style?: React.CSSProperties;
}

export interface GameState {
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    temporaryMultiplier: number;
    particles: BaseParticle[];
    foodParticles: FoodParticle[];
    floatingNumbers: FloatingNumber[];
    cells: Cell[];
    backgroundCells: Cell[];
    squidExpression: SquidExpression;
    foodBeingEaten: Set<number>;
    cellDivision: boolean;
    squidFormOpacity: number;
    showSquidForm: boolean;
}