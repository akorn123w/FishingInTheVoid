import { HandlerState, HandlerCallbacks } from '../BaseHandler';
import { BaseParticle } from '@/types/base';

export interface ParticleHandlerState extends HandlerState {
    particles: BaseParticle[];
    isAnimating: boolean;
    lastUpdateTime: number;
}

export interface ParticleHandlerCallbacks extends HandlerCallbacks {
    onParticleUpdate: (particles: BaseParticle[]) => void;
}