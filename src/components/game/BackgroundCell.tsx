import React, { useEffect, useState } from 'react';
import './Game.css';

interface BackgroundCellProps {
    x: number;
    y: number;
    size: number;
    onComplete: () => void;
}

export const BackgroundCell: React.FC<BackgroundCellProps> = ({ x, y, size, onComplete }) => {
    const [opacity, setOpacity] = useState(0);
    const [scale, setScale] = useState(0);

    useEffect(() => {
        const duration = 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setOpacity(progress * 0.3);
            setScale(progress);

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
            className="background-cell"
            style={{
                left: x,
                top: y,
                width: size,
                height: size,
                opacity,
                transform: `scale(${scale})`
            }}
        />
    );
};