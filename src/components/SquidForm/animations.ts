import { useEffect, useState } from 'react';

export const useTentacleAnimation = () => {
    const [tentaclePhase, setTentaclePhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTentaclePhase(prev => (prev + 0.1) % (Math.PI * 2));
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return tentaclePhase;
};