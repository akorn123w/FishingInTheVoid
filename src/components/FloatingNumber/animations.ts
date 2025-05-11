import { useEffect, useState } from 'react';

export const useFloatingAnimation = () => {
    const [opacity, setOpacity] = useState(1);
    const [y, setY] = useState(0);

    useEffect(() => {
        const startTime = Date.now();
        const duration = 500; // 500ms total animation
        const fadeStart = 400; // Start fading at 400ms

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Move up faster at the start, slower at the end
            const moveProgress = 1 - Math.pow(1 - progress, 2);
            setY(-20 * moveProgress); // Move up 20% of the screen

            // Fade out in the last 100ms
            if (elapsed > fadeStart) {
                const fadeProgress = (elapsed - fadeStart) / (duration - fadeStart);
                setOpacity(1 - fadeProgress);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, []);

    return { opacity, y };
};