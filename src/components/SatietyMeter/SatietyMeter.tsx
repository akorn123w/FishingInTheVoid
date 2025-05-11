import React, { useEffect, useState } from 'react';
import { useSatietyAnimation } from './animations';

interface SatietyMeterProps {
    currentSatiety: number;
    maxSatiety: number;
    level: number;
    onLevelUp: () => void;
}

const SATIETY_COLORS = [
    '#4a90e2', // Blue
    '#50c878', // Emerald
    '#ffd700', // Gold
    '#ff6b6b', // Coral
    '#9370db', // Purple
    '#ff1493', // Deep Pink
    '#00ffff', // Cyan
    '#ff4500', // Orange Red
];

export const SatietyMeter: React.FC<SatietyMeterProps> = ({
    currentSatiety,
    maxSatiety,
    level,
    onLevelUp
}) => {
    const [fillColor, setFillColor] = useState(SATIETY_COLORS[0]);
    const [bgColor, setBgColor] = useState(SATIETY_COLORS[0]);
    const { fillAnimation } = useSatietyAnimation(currentSatiety, maxSatiety);

    useEffect(() => {
        // When meter is full, level up and change colors
        if (currentSatiety >= maxSatiety) {
            onLevelUp();
            setBgColor(fillColor);
            setFillColor(SATIETY_COLORS[(level + 1) % SATIETY_COLORS.length]);
        }
    }, [currentSatiety, maxSatiety, level, fillColor, onLevelUp]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: bgColor,
                    borderRadius: '5px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${fillAnimation}%`,
                        height: '100%',
                        backgroundColor: fillColor,
                        transition: 'width 0.3s ease-out',
                    }}
                />
            </div>
            <div style={{ color: fillColor, fontSize: '12px', fontWeight: 'bold' }}>
                Level {level}
            </div>
        </div>
    );
};