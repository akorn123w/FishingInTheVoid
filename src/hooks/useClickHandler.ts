import { useCallback } from 'react';

interface GameObject {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    velocity: { x: number; y: number };
}

interface ClickHandlerProps {
    clickCount: number;
    setClickCount: React.Dispatch<React.SetStateAction<number>>;
    clickMultiplier: number;
    gameObjects: GameObject[];
    setGameObjects: React.Dispatch<React.SetStateAction<GameObject[]>>;
    objectLogs: { [key: string]: { timestamp: string; message: string } };
    setObjectLogs: React.Dispatch<React.SetStateAction<{ [key: string]: { timestamp: string; message: string } }>>;
}

export const useClickHandler = ({
    clickCount,
    setClickCount,
    clickMultiplier,
    gameObjects,
    setGameObjects,
    objectLogs,
    setObjectLogs
}: ClickHandlerProps) => {
    const handleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Update click count
        setClickCount(prev => prev + clickMultiplier);

        // Check for collisions with game objects
        const clickedObjects = gameObjects.filter(obj => {
            const dx = x - obj.x;
            const dy = y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= obj.radius;
        });

        if (clickedObjects.length > 0) {
            // Remove clicked objects
            setGameObjects(prev => prev.filter(obj => !clickedObjects.includes(obj)));

            // Log the interaction
            clickedObjects.forEach(obj => {
                const timestamp = new Date().toLocaleTimeString();
                setObjectLogs(prev => ({
                    ...prev,
                    [obj.id]: { timestamp, message: `Object ${obj.id} was clicked` }
                }));
            });
        }
    }, [clickCount, setClickCount, clickMultiplier, gameObjects, setGameObjects, setObjectLogs]);

    return { handleClick };
};