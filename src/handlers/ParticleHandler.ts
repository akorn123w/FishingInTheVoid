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
        // No specific event handling needed for particles
    }

    private updateParticles() {
        const now = Date.now();
        const deltaTime = now - this.state.lastUpdateTime;

        const updatedParticles = this.state.particles.map(particle => {
            // Update position based on angle and speed
            const newX = particle.x + Math.cos(particle.angle) * particle.speed * deltaTime;
            const newY = particle.y + Math.sin(particle.angle) * particle.speed * deltaTime;

            // Wrap around screen edges
            const wrappedX = ((newX % 100) + 100) % 100;
            const wrappedY = ((newY % 100) + 100) % 100;

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
    }

    private animate() {
        if (!this.state.isAnimating) return;

        this.updateParticles();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
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
        super.initialize();

        // Initialize particles
        const initialParticles: Particle[] = Array.from({ length: PARTICLES.INITIAL_COUNT }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * (PARTICLES.MAX_SIZE - PARTICLES.MIN_SIZE) + PARTICLES.MIN_SIZE,
            speed: Math.random() * (PARTICLES.MAX_SPEED - PARTICLES.MIN_SPEED) + PARTICLES.MIN_SPEED,
            angle: Math.random() * Math.PI * 2,
            opacity: 0.3,
            createdAt: Date.now()
        }));

        this.state = {
            ...this.state,
            particles: initialParticles,
            isAnimating: true,
            lastUpdateTime: Date.now()
        };

        this.startAnimation();
    }

    cleanup(): void {
        this.stopAnimation();
        super.cleanup();
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

        this.state = {
            ...this.state,
            particles: updatedParticles
        } as Partial<ParticleHandlerState>;
    }

    getState(): ParticleHandlerState {
        return { ...this.state };
    }
}