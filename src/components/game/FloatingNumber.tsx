import React, { useEffect, useState } from 'react';
import './Game.css';

interface FloatingNumberProps {
    value: number;
    x: number;
    y: number;
    onComplete: () => void;
}

export const FloatingNumber: React.FC<FloatingNumberProps> = ({ value, x, y, onComplete }) => {
    const [position, setPosition] = useState({ x, y });
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const duration = 1000;
        const startTime = Date.now();
        const startY = y;
        const endY = y - 50;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setPosition({
                x: x + Math.sin(progress * Math.PI * 2) * 20,
                y: startY + (endY - startY) * progress
            });
            setOpacity(1 - progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };

        requestAnimationFrame(animate);
    }, [x, y, onComplete]);

    return (
        <div
            className="floating-number"
            style={{
                left: position.x,
                top: position.y,
                opacity
            }}
        >
            +{value}
        </div>
    );
};