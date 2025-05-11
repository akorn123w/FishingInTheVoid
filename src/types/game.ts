export interface Position {
    x: number;
    y: number;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    angle: number;
    opacity: number;
    createdAt: number;
    eaten?: boolean;
    isBeingEaten?: boolean;
    type?: number;
}

export interface FoodParticle extends Particle {
    type: number;
    eaten: boolean;
    isBeingEaten: boolean;
    opacity: number;
    createdAt: number;
}

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

export type SquidExpression = 'content' | 'sucking' | 'blinking';