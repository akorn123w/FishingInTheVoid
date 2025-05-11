import { useCallback } from 'react';

interface DevToolsProps {
    isDevMode: boolean;
    setIsDevMode: React.Dispatch<React.SetStateAction<boolean>>;
    isPaused: boolean;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
    clickCount: number;
    setClickCount: React.Dispatch<React.SetStateAction<number>>;
    clickMultiplier: number;
    setClickMultiplier: React.Dispatch<React.SetStateAction<number>>;
}

export const useDevTools = ({
    isDevMode,
    setIsDevMode,
    isPaused,
    setIsPaused,
    clickCount,
    setClickCount,
    clickMultiplier,
    setClickMultiplier
}: DevToolsProps) => {
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        // Toggle dev mode with Ctrl + D
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            setIsDevMode(prev => !prev);
        }

        // Toggle pause with Space
        if (event.key === ' ') {
            event.preventDefault();
            setIsPaused(prev => !prev);
        }

        // Add clicks with Ctrl + C
        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault();
            setClickCount(prev => prev + 1000);
        }

        // Reset clicks with Ctrl + R
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            setClickCount(0);
        }

        // Toggle click multiplier with Ctrl + M
        if (event.ctrlKey && event.key === 'm') {
            event.preventDefault();
            setClickMultiplier(prev => prev === 1 ? 100 : 1);
        }
    }, [setIsDevMode, setIsPaused, setClickCount, setClickMultiplier]);

    return { handleKeyPress };
};