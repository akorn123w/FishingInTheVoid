import React from 'react';
import './Game.css';

interface ClickCounterProps {
    clickCount: number;
}

export const ClickCounter: React.FC<ClickCounterProps> = ({ clickCount }) => {
    return (
        <div className="click-counter">
            Clicks: {clickCount}
        </div>
    );
};