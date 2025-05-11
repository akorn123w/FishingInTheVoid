import React from 'react';
import { FloatingNumber } from './FloatingNumber';
import { SquidForm } from './SquidForm';
import { BackgroundCell } from './BackgroundCell';
import { FoodParticle } from './FoodParticle';
import { MorphingCell } from './MorphingCell';

export interface Animation {
    id: string;
    type: 'floatingNumber' | 'squidForm' | 'backgroundCell' | 'foodParticle' | 'morphingCell';
    x: number;
    y: number;
    value?: number;
    size?: number;
    color?: string;
    progress?: number;
}

interface AnimationManagerProps {
    animations: Animation[];
    onAnimationComplete: (id: string) => void;
}

export const AnimationManager: React.FC<AnimationManagerProps> = ({
    animations,
    onAnimationComplete
}) => {
    return (
        <>
            {animations.map(anim => {
                switch (anim.type) {
                    case 'floatingNumber':
                        return (
                            <FloatingNumber
                                key={anim.id}
                                value={anim.value!}
                                x={anim.x}
                                y={anim.y}
                                onComplete={() => onAnimationComplete(anim.id)}
                            />
                        );
                    case 'squidForm':
                        return (
                            <SquidForm
                                key={anim.id}
                                x={anim.x}
                                y={anim.y}
                                onComplete={() => onAnimationComplete(anim.id)}
                            />
                        );
                    case 'backgroundCell':
                        return (
                            <BackgroundCell
                                key={anim.id}
                                x={anim.x}
                                y={anim.y}
                                size={anim.size!}
                                onComplete={() => onAnimationComplete(anim.id)}
                            />
                        );
                    case 'foodParticle':
                        return (
                            <FoodParticle
                                key={anim.id}
                                x={anim.x}
                                y={anim.y}
                                size={anim.size!}
                                color={anim.color!}
                                onComplete={() => onAnimationComplete(anim.id)}
                            />
                        );
                    case 'morphingCell':
                        return (
                            <MorphingCell
                                key={anim.id}
                                progress={anim.progress!}
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
};