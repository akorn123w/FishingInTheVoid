import { useEffect, useState } from 'react';

export const useFloatingAnimation = () => {
    const [opacity, setOpacity] = useState(1);
    const [y, setY] = useState(0);

    useEffect(() => {
        const fadeOut = setTimeout(() => {
            setOpacity(0);
        }, 1000);

        const floatUp = setInterval(() => {
            setY(prev => prev - 1);
        }, 50);

        return () => {
            clearTimeout(fadeOut);
            clearInterval(floatUp);
        };
    }, []);

    return { opacity, y };
};