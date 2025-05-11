import { BaseParticle } from '@/types/base';

export interface FoodParticle extends BaseParticle {
    type: number;
    eaten: boolean;
    isBeingEaten: boolean;
}

export interface FoodParticleProps {
    particle: FoodParticle;
}