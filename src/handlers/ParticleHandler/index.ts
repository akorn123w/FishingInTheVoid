import { AbstractHandler } from '../BaseHandler';
import { PARTICLES } from '@/constants/gameConstants';
import { BaseParticle } from '@/types/base';
import { ParticleHandlerState, ParticleHandlerCallbacks } from './types';
import { PARTICLE_HANDLER } from './constants';

export class ParticleHandler extends AbstractHandler {
    private particleCallbacks: ParticleHandlerCallbacks;
    private animationFrameId: number | null = null;
    protected state: ParticleHandlerState;

    constructor(
        initialState: Partial<ParticleHandlerState>,
        callbacks: ParticleHandlerCallbacks
    ) {
        super(initialState, callbacks);
        this.particleCallbacks = callbacks;
        this.state = {
            timestamp: Date.now(),
            isActive: true,
            particles: [],
            isAnimating: false,
            lastUpdateTime: Date.now(),
            ...initialState
        };
    }

    handleEvent(event: any): void {
        if (!this.state.isActive) {
            this.callbacks.onError(new Error('Particle handler is not active'));
            return;
        }
        // No specific event handling needed for particles
    }

    private updateParticles() {
        try {
            const now = Date.now();
            const deltaTime = now - this.state.lastUpdateTime;

            const updatedParticles = this.state.particles.map(particle => {
                // Update position based on angle and speed
                const newX = particle.x + Math.cos(particle.angle) * particle.speed * deltaTime;
                const newY = particle.y + Math.sin(particle.angle) * particle.speed * deltaTime;

                // Wrap around screen edges
                const wrappedX = ((newX % PARTICLE_HANDLER.SCREEN_BOUNDS.MAX) + PARTICLE_HANDLER.SCREEN_BOUNDS.MAX) % PARTICLE_HANDLER.SCREEN_BOUNDS.MAX;
                const wrappedY = ((newY % PARTICLE_HANDLER.SCREEN_BOUNDS.MAX) + PARTICLE_HANDLER.SCREEN_BOUNDS.MAX) % PARTICLE_HANDLER.SCREEN_BOUNDS.MAX;

                return {
                    ...particle,
                    x: wrappedX,
                    y: wrappedY
                };
            });

            this.state = {
                ...this.state,
                particles: updatedParticles,
                lastUpdateTime: now
            };

            this.particleCallbacks.onParticleUpdate(updatedParticles);
        } catch (error) {
            console.warn('Error updating particles:', error);
            // Don't throw the error, just log it and continue
        }
    }

    private animate() {
        if (!this.state.isAnimating) return;

        try {
            this.updateParticles();
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        } catch (error) {
            console.warn('Error in particle animation:', error);
            this.stopAnimation();
        }
    }

    startAnimation(): void {
        if (!this.state.isAnimating) {
            this.state = {
                ...this.state,
                isAnimating: true
            };
            this.animate();
        }
    }

    stopAnimation(): void {
        if (this.state.isAnimating) {
            this.state = {
                ...this.state,
                isAnimating: false
            };
            if (this.animationFrameId !== null) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    initialize(): void {
        try {
            super.initialize();

            // Initialize particles
            const initialParticles: BaseParticle[] = Array.from({ length: PARTICLES.INITIAL_COUNT }, (_, i) => ({
                id: i,
                x: Math.random() * PARTICLE_HANDLER.SCREEN_BOUNDS.MAX,
                y: Math.random() * PARTICLE_HANDLER.SCREEN_BOUNDS.MAX,
                size: Math.random() * (PARTICLES.MAX_SIZE - PARTICLES.MIN_SIZE) + PARTICLES.MIN_SIZE,
                speed: Math.random() * (PARTICLES.MAX_SPEED - PARTICLES.MIN_SPEED) + PARTICLES.MIN_SPEED,
                angle: Math.random() * Math.PI * 2,
                opacity: PARTICLE_HANDLER.INITIAL_OPACITY,
                createdAt: Date.now()
            }));

            this.state = {
                ...this.state,
                particles: initialParticles,
                isAnimating: true,
                lastUpdateTime: Date.now()
            };

            this.startAnimation();
        } catch (error) {
            console.warn('Error initializing particle handler:', error);
            // Don't throw the error, just log it
        }
    }

    cleanup(): void {
        try {
            this.stopAnimation();
            super.cleanup();
        } catch (error) {
            console.warn('Error cleaning up particle handler:', error);
            // Don't throw the error, just log it
        }
    }

    getState(): ParticleHandlerState {
        return { ...this.state };
    }
}