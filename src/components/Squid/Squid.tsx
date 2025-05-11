import React from 'react';
import { SquidProps } from './types';
import { useSquidAnimation } from './animations';
import { SatietyMeter } from '../SatietyMeter/SatietyMeter';

const Squid: React.FC<SquidProps> = ({
    position,
    rotation,
    scale,
    expression,
    satiety,
    onSatietyLevelUp
}) => {
    const { tentacleAnimation, bodyAnimation } = useSquidAnimation();

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                transition: 'transform 0.3s ease-out',
                willChange: 'transform',
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100px',
                    height: '100px',
                }}
            >
                {/* Squid body */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#4a90e2',
                        borderRadius: '50%',
                        transform: `scale(${bodyAnimation.scale})`,
                        transition: 'transform 0.3s ease-out',
                    }}
                />

                {/* Tentacles */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        transform: `scale(${tentacleAnimation.scale})`,
                        transition: 'transform 0.3s ease-out',
                    }}
                >
                    {/* Tentacle elements */}
                </div>

                {/* Satiety Meter */}
                <SatietyMeter
                    currentSatiety={satiety.current}
                    maxSatiety={satiety.max}
                    level={satiety.level}
                    onLevelUp={onSatietyLevelUp}
                />
            </div>
        </div>
    );
};

export default Squid;