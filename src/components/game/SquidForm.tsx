import React, { useEffect, useState } from 'react';
import './Game.css';

interface SquidFormProps {
    x: number;
    y: number;
    onComplete: () => void;
}

export const SquidForm: React.FC<SquidFormProps> = ({ x, y, onComplete }) => {
    const [position, setPosition] = useState({ x, y });
    const [scale, setScale] = useState(0);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const duration = 500;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setScale(progress);
            setRotation(progress * 360);

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
            className="squid-form"
            style={{
                left: position.x,
                top: position.y,
                transform: `scale(${scale}) rotate(${rotation}deg)`
            }}
        >
            <div className="squid-body" />
            <div className="squid-tentacles">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="tentacle"
                        style={{
                            transform: `rotate(${i * 45}deg)`
                        }}
                    />
                ))}
            </div>
        </div>
    );
};