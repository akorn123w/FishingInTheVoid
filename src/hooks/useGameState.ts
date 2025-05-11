import { useState } from 'react';

interface GameObject {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    velocity: { x: number; y: number };
}

export const useGameState = () => {
    const [clickCount, setClickCount] = useState(0);
    const [purchasedItems, setPurchasedItems] = useState<{ [key: string]: number }>({});
    const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    return {
        clickCount,
        setClickCount,
        purchasedItems,
        setPurchasedItems,
        gameObjects,
        setGameObjects,
        isPaused,
        setIsPaused
    };
};