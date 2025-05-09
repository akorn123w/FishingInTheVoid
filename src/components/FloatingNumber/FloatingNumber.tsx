import React from 'react';
import type { FloatingNumberProps } from './types';
import { useFloatingAnimation } from './animations';

const FloatingNumber: React.FC<FloatingNumberProps> = ({ number }) => {
    const { opacity, y } = useFloatingAnimation();

    return (
        <div
            style={{
                position: 'absolute',
                left: `${number.x}%`,
                top: `${number.y + y}%`,
                color: '#4a90e2',
                fontSize: '24px',
                fontWeight: 'bold',
                textShadow: '0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 10px rgba(74, 144, 226, 0.5)',
                opacity: opacity * number.opacity,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                transition: 'all 0.5s ease-out',
            }}
        >
            +{number.value}
        </div>
    );
};

export default FloatingNumber;