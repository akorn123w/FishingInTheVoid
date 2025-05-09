export interface Position {
    x: number;
    y: number;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    eaten: boolean;
    type: number;
    createdAt: number;
    opacity: number;
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

export type SquidExpression = 'content' | 'trying' | 'eating';