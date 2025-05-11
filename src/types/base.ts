export interface Position {
    x: number;
    y: number;
}

export interface BaseParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    angle: number;
    opacity: number;
    createdAt: number;
}

export type SquidExpression = 'content' | 'sucking' | 'blinking';