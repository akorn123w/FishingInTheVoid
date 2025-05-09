import React from 'react';
import { FoodParticleProps } from './types';

const FoodParticle: React.FC<FoodParticleProps> = ({ particle }) => {
    const getParticleColor = () => {
        switch (particle.type) {
            case 1: return '#ff6b6b'; // Reddish
            case 2: return '#4ecdc4'; // Teal
            case 3: return '#ffe66d'; // Yellow
            case 4: return '#95e1d3'; // Mint
            default: return '#ff6b6b';
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: getParticleColor(),
                borderRadius: '50%',
                opacity: particle.eaten ? 0 : particle.opacity,
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 0.3s ease-out',
                filter: 'blur(1px)',
                boxShadow: '0 0 10px currentColor',
            }}
        />
    );
};

export default FoodParticle;