import { AbstractHandler, HandlerState, HandlerCallbacks } from './BaseHandler';
import { PARTICLES } from '../constants/gameConstants';
import { Particle } from '@/types/game';

export interface ParticleHandlerState extends HandlerState {
    particles: Particle[];
    isAnimating: boolean;
    lastUpdateTime: number;
}

export interface ParticleHandlerCallbacks extends HandlerCallbacks {
    onParticleUpdate: (particles: Particle[]) => void;
}

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

        if (this.state.isAnimating) {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.state.lastUpdateTime;

            const updatedParticles = this.state.particles.map(particle => {
                // If being pushed, animate velocity
                if (particle.pushTime && particle.pushTime > 0) {
                    // Decay push over time
                    const decay = PARTICLES.PUSH_DECAY;
                    const vx = (particle.vx || 0) * decay;
                    const vy = (particle.vy || 0) * decay;
                    const pushTime = particle.pushTime - 1;

                    return {
                        ...particle,
                        x: (particle.x + vx + 100) % 100,
                        y: (particle.y + vy + 100) % 100,
                        vx,
                        vy,
                        pushTime: pushTime > 0 ? pushTime : 0,
                    };
                } else {
                    // Normal floating
                    return {
                        ...particle,
                        x: (particle.x + Math.cos(particle.angle) * particle.speed + 100) % 100,
                        y: (particle.y + Math.sin(particle.angle) * particle.speed + 100) % 100,
                        angle: particle.angle + (Math.random() - 0.5) * 0.1,
                        vx: 0,
                        vy: 0,
                        pushTime: 0,
                    };
                }
            });

            this.updateState({
                particles: updatedParticles,
                lastUpdateTime: currentTime
            } as Partial<ParticleHandlerState>);
            this.particleCallbacks.onParticleUpdate(updatedParticles);
        }
    }

    initialize(): void {
        super.initialize();

        // Initialize particles
        const initialParticles: Particle[] = Array.from({ length: PARTICLES.INITIAL_COUNT }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * (PARTICLES.MAX_SIZE - PARTICLES.MIN_SIZE) + PARTICLES.MIN_SIZE,
            speed: Math.random() * (PARTICLES.MAX_SPEED - PARTICLES.MIN_SPEED) + PARTICLES.MIN_SPEED,
            angle: Math.random() * Math.PI * 2,
            vx: 0,
            vy: 0,
            pushTime: 0
        }));

        this.updateState({
            particles: initialParticles,
            isAnimating: true,
            lastUpdateTime: Date.now()
        } as Partial<ParticleHandlerState>);

        // Start animation loop
        this.startAnimation();
    }

    cleanup(): void {
        super.cleanup();
        this.stopAnimation();
        this.updateState({ isAnimating: false } as Partial<ParticleHandlerState>);
    }

    private startAnimation(): void {
        const animate = () => {
            this.handleEvent({ type: 'animate' });
            this.animationFrameId = requestAnimationFrame(animate);
        };
        this.animationFrameId = requestAnimationFrame(animate);
    }

    private stopAnimation(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // Method to push particles away from a point
    pushParticles(x: number, y: number, force: number = 1): void {
        const updatedParticles = this.state.particles.map(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 20) { // Only affect particles within 20 units
                const angle = Math.atan2(dy, dx);
                const pushForce = force * (1 - distance / 20); // Stronger push when closer

                return {
                    ...particle,
                    vx: Math.cos(angle) * pushForce,
                    vy: Math.sin(angle) * pushForce,
                    pushTime: 10 // Number of frames to apply the push
                };
            }
            return particle;
        });

        this.updateState({ particles: updatedParticles } as Partial<ParticleHandlerState>);
    }

    getState(): ParticleHandlerState {
        return { ...this.state };
    }
}