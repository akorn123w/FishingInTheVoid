import React from 'react';
import { FoodParticleProps } from './types';
import { ANIMATION } from '../../constants/gameConstants';

const FoodParticle: React.FC<FoodParticleProps> = ({ particle }) => {
    const [swirlPhase, setSwirlPhase] = React.useState(0);
    const [isBeingEaten, setIsBeingEaten] = React.useState(false);
    const startTimeRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (particle.isBeingEaten && !isBeingEaten) {
            setIsBeingEaten(true);
            startTimeRef.current = Date.now();

            const animateSwirl = () => {
                if (!startTimeRef.current) return;

                const elapsed = Date.now() - startTimeRef.current;
                const progress = Math.min(elapsed / ANIMATION.EATING_SWIRL_DURATION, 1);

                // Calculate swirl phase based on progress
                const newPhase = progress * Math.PI * 4; // Two full rotations
                setSwirlPhase(newPhase);

                if (progress < 1) {
                    requestAnimationFrame(animateSwirl);
                }
            };

            requestAnimationFrame(animateSwirl);
        }
    }, [particle.isBeingEaten, isBeingEaten]);

    const getParticleColor = () => {
        switch (particle.type) {
            case 1: return '#ff6b6b'; // Reddish
            case 2: return '#4ecdc4'; // Teal
            case 3: return '#ffe66d'; // Yellow
            case 4: return '#95e1d3'; // Mint
            default: return '#ff6b6b';
        }
    };

    // Calculate position with swirl effect
    const getPosition = () => {
        if (!isBeingEaten || !startTimeRef.current) {
            return { x: particle.x, y: particle.y };
        }

        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / ANIMATION.EATING_SWIRL_DURATION, 1);

        // Calculate swirl radius that decreases over time
        const swirlRadius = (1 - progress) * 50; // Max radius of 50px

        // Calculate final position (squid's mouth)
        const targetX = 50; // Center of the squid
        const targetY = 60; // Mouth position

        // Calculate current position with swirl
        const currentX = particle.x + Math.cos(swirlPhase) * swirlRadius;
        const currentY = particle.y + Math.sin(swirlPhase) * swirlRadius;

        // Interpolate between current position and target
        return {
            x: currentX + (targetX - currentX) * progress,
            y: currentY + (targetY - currentY) * progress
        };
    };

    const position = getPosition();

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: getParticleColor(),
                borderRadius: '50%',
                opacity: particle.eaten ? 0 : particle.opacity,
                transform: 'translate(-50%, -50%)',
                transition: isBeingEaten ? 'none' : 'opacity 0.3s ease-out',
                filter: 'blur(1px)',
                boxShadow: '0 0 10px currentColor',
            }}
        />
    );
};

export default FoodParticle;