import React from 'react';
import './Game.css';

interface MorphingCellProps {
    progress: number;
}

export const MorphingCell: React.FC<MorphingCellProps> = ({ progress }) => {
    const radius = 20 + Math.sin(progress * Math.PI * 2) * 5;
    const rotation = progress * 360;
    const opacity = 0.3 + Math.sin(progress * Math.PI * 2) * 0.1;

    return (
        <div
            className="morphing-cell"
            style={{
                width: radius * 2,
                height: radius * 2,
                opacity,
                transform: `rotate(${rotation}deg)`
            }}
        >
            <div className="morphing-cell-inner" />
        </div>
    );
};