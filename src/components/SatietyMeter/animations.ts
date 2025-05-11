import { useState, useEffect } from 'react';

export const useSatietyAnimation = (currentSatiety: number, maxSatiety: number) => {
    const [fillAnimation, setFillAnimation] = useState(0);

    useEffect(() => {
        const fillPercentage = (currentSatiety / maxSatiety) * 100;
        setFillAnimation(fillPercentage);
    }, [currentSatiety, maxSatiety]);

    return { fillAnimation };
};