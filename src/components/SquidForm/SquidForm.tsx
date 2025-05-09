import React from 'react';
import type { SquidFormProps } from './types';
import { useTentacleAnimation } from './animations';
import { ANIMATION } from '../../constants/gameConstants';

const SquidForm: React.FC<SquidFormProps> = ({ isBlinking = false, isHappy = false, expression = 'content', scale = 1 }) => {
    const tentaclePhase = useTentacleAnimation();
    const [shakeOffset, setShakeOffset] = React.useState(0);
    const [cheekColor, setCheekColor] = React.useState('#4a90e2');

    // Handle eating animation effects
    React.useEffect(() => {
        if (expression === 'eating') {
            // Start shaking animation
            const shakeInterval = setInterval(() => {
                setShakeOffset(Math.sin(Date.now() * 0.01) * ANIMATION.EATING_SHAKE_INTENSITY);
            }, 16);

            // Animate cheeks to red
            const startTime = Date.now();
            const animateCheeks = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / ANIMATION.EATING_DURATION, 1);
                const redIntensity = Math.min(progress * 255, 255);
                setCheekColor(`rgb(${redIntensity}, ${74 - redIntensity * 0.2}, ${226 - redIntensity * 0.5})`);

                if (progress < 1) {
                    requestAnimationFrame(animateCheeks);
                }
            };
            requestAnimationFrame(animateCheeks);

            return () => {
                clearInterval(shakeInterval);
                setShakeOffset(0);
                setCheekColor('#4a90e2');
            };
        }
    }, [expression]);

    const getMouthPath = () => {
        switch (expression) {
            case 'trying':
                return `M40 60 Q50 65 60 60`;
            case 'eating':
                return `M35 60 Q50 75 65 60`;
            case 'content':
            default:
                return `M40 60 Q50 70 60 60`;
        }
    };

    return (
        <svg
            width="300"
            height="300"
            viewBox="-50 -50 200 200"
            style={{
                filter: `drop-shadow(0 0 16px #4a90e2aa)`,
                transformOrigin: 'center center',
                transform: `scale(${scale}) translate(${shakeOffset}px, ${shakeOffset}px)`,
                overflow: 'visible',
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
        >
            {/* Main body */}
            <g>
                {/* Head */}
                <ellipse
                    cx="50"
                    cy="50"
                    rx="40"
                    ry="35"
                    fill="url(#cellGradient)"
                    stroke={cheekColor}
                    strokeWidth="2"
                />

                {/* Eyes */}
                <g>
                    <ellipse
                        cx="35"
                        cy="45"
                        rx={expression === 'eating' ? "6" : "8"}
                        ry={isBlinking ? "2" : expression === 'eating' ? "8" : "12"}
                        fill="#2a4a8a"
                        stroke={cheekColor}
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease-out' }}
                    />
                    <ellipse
                        cx="65"
                        cy="45"
                        rx={expression === 'eating' ? "6" : "8"}
                        ry={isBlinking ? "2" : expression === 'eating' ? "8" : "12"}
                        fill="#2a4a8a"
                        stroke={cheekColor}
                        strokeWidth="1"
                        style={{ transition: 'all 0.3s ease-out' }}
                    />
                    <circle cx="35" cy="45" r="3" fill="#e0f7ff" />
                    <circle cx="65" cy="45" r="3" fill="#e0f7ff" />
                </g>

                {/* Mouth */}
                <path
                    d={getMouthPath()}
                    stroke={cheekColor}
                    strokeWidth="2"
                    fill="none"
                    style={{ transition: 'all 0.3s ease-out' }}
                />

                {/* Tentacles */}
                <g>
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * Math.PI * 2) / 8;
                        const startX = 50 + Math.cos(angle) * 40;
                        const startY = 50 + Math.sin(angle) * 35;
                        const waveOffset = Math.sin(tentaclePhase + i * 0.5) * 10;
                        const endX = startX + Math.cos(angle) * (60 + waveOffset);
                        const endY = startY + Math.sin(angle) * (60 + waveOffset);

                        return (
                            <path
                                key={i}
                                d={`M${startX} ${startY} Q${(startX + endX) / 2} ${(startY + endY) / 2} ${endX} ${endY}`}
                                stroke="#4a90e2"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        );
                    })}
                </g>

                {/* Suckers on tentacles */}
                <g>
                    {Array.from({ length: 8 }).map((_, i) => {
                        const angle = (i * Math.PI * 2) / 8;
                        const baseX = 50 + Math.cos(angle) * 40;
                        const baseY = 50 + Math.sin(angle) * 35;
                        const waveOffset = Math.sin(tentaclePhase + i * 0.5) * 10;

                        return Array.from({ length: 4 }).map((_, j) => {
                            const distance = 15 + j * 15;
                            const x = baseX + Math.cos(angle) * (distance + waveOffset);
                            const y = baseY + Math.sin(angle) * (distance + waveOffset);

                            return (
                                <circle
                                    key={`${i}-${j}`}
                                    cx={x}
                                    cy={y}
                                    r="2"
                                    fill="#4a90e2"
                                    stroke="#2a4a8a"
                                    strokeWidth="0.5"
                                />
                            );
                        });
                    })}
                </g>
            </g>

            {/* Gradients */}
            <defs>
                <radialGradient id="cellGradient" cx="45%" cy="45%" r="50%">
                    <stop offset="0%" stopColor="#bfe6ff" />
                    <stop offset="40%" stopColor="#6ba4e7" />
                    <stop offset="70%" stopColor="#4a90e2" />
                    <stop offset="100%" stopColor="#2a4a8a" />
                </radialGradient>
            </defs>
        </svg>
    );
};

export default SquidForm;