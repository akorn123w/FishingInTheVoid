import React from 'react';
import './Game.css';

interface DevControlsProps {
    clickMultiplier: number;
    onMultiplierChange: (multiplier: number) => void;
    objectLogs: { [key: string]: { timestamp: string; message: string } };
}

export const DevControls: React.FC<DevControlsProps> = ({
    clickMultiplier,
    onMultiplierChange,
    objectLogs
}) => {
    return (
        <div className="dev-controls" data-dev-area="true">
            <button
                className={`dev-button ${clickMultiplier > 1 ? 'active' : ''}`}
                onClick={() => {
                    switch (clickMultiplier) {
                        case 1: onMultiplierChange(99); break;
                        case 99: onMultiplierChange(100); break;
                        case 100: onMultiplierChange(1000); break;
                        case 1000: onMultiplierChange(5000); break;
                        default: onMultiplierChange(1);
                    }
                }}
            >
                Click Multiplier: x{clickMultiplier.toLocaleString()}
            </button>

            <div className="dev-logs">
                {Object.entries(objectLogs).map(([id, log]) => (
                    <div key={id} className="dev-log-entry">
                        {log.timestamp}: {log.message}
                    </div>
                ))}
            </div>
        </div>
    );
};