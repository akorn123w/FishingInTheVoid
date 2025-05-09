import React from 'react';
import type { CellProps } from './types';

const Cell: React.FC<CellProps> = ({ type, x, y, rotation, scale, style }) => {
    const getCellColor = () => {
        switch (type) {
            case 1: return '#ff6b6b'; // Reddish
            case 2: return '#4ecdc4'; // Teal
            case 3: return '#ffe66d'; // Yellow
            case 4: return '#95e1d3'; // Mint
            default: return '#ff6b6b';
        }
    };

    const getCellShape = () => {
        switch (type) {
            case 1:
                return (
                    <path
                        d="M50 20 L80 50 L50 80 L20 50 Z"
                        fill={getCellColor()}
                        stroke="#ffffff33"
                        strokeWidth="1"
                    />
                );
            case 2:
                return (
                    <path
                        d="M50 20 Q80 50 50 80 Q20 50 50 20"
                        fill={getCellColor()}
                        stroke="#ffffff33"
                        strokeWidth="1"
                    />
                );
            case 3:
                return (
                    <path
                        d="M50 20 L65 35 L80 20 L65 5 L50 20"
                        fill={getCellColor()}
                        stroke="#ffffff33"
                        strokeWidth="1"
                    />
                );
            case 4:
                return (
                    <circle
                        cx="50"
                        cy="50"
                        r="30"
                        fill={getCellColor()}
                        stroke="#ffffff33"
                        strokeWidth="1"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <svg
            width="60"
            height="60"
            viewBox="0 0 100 100"
            style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotation}rad) scale(${scale})`,
                opacity: 0.8,
                ...style
            }}
        >
            {getCellShape()}
        </svg>
    );
};

export default Cell;