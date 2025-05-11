import React, { useEffect, useState } from 'react';
import './Game.css';

interface FoodParticleProps {
    x: number;
    y: number;
    size: number;
    color: string;
    onComplete: () => void;
}

export const FoodParticle: React.FC<FoodParticleProps> = ({
    x,
    y,
    size,
    color,
    onComplete
}) => {
    const [opacity, setOpacity] = useState(1);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setOpacity(1 - progress);
            setScale(1 + progress * 0.5);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };

        requestAnimationFrame(animate);
    }, [onComplete]);

    return (
        <div
            className="food-particle"
            style={{
                left: x,
                top: y,
                width: size,
                height: size,
                backgroundColor: color,
                opacity,
                transform: `scale(${scale})`
            }}
        />
    );
};