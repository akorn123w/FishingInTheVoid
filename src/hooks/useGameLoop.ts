import { useEffect, RefObject } from 'react';

interface GameObject {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    velocity: { x: number; y: number };
}

interface GameLoopProps {
    canvasRef: RefObject<HTMLCanvasElement>;
    gameObjects: GameObject[];
    setGameObjects: React.Dispatch<React.SetStateAction<GameObject[]>>;
    isPaused: boolean;
    objectLogs: { [key: string]: { timestamp: string; message: string } };
    setObjectLogs: React.Dispatch<React.SetStateAction<{ [key: string]: { timestamp: string; message: string } }>>;
}

export const useGameLoop = ({
    canvasRef,
    gameObjects,
    setGameObjects,
    isPaused,
    objectLogs,
    setObjectLogs
}: GameLoopProps) => {
    useEffect(() => {
        if (!canvasRef.current || isPaused) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const updateGameObjects = () => {
            setGameObjects(prevObjects => {
                return prevObjects.map(obj => {
                    const newX = obj.x + obj.velocity.x;
                    const newY = obj.y + obj.velocity.y;

                    // Bounce off walls
                    if (newX - obj.radius < 0 || newX + obj.radius > canvas.width) {
                        obj.velocity.x *= -1;
                    }
                    if (newY - obj.radius < 0 || newY + obj.radius > canvas.height) {
                        obj.velocity.y *= -1;
                    }

                    return {
                        ...obj,
                        x: Math.max(obj.radius, Math.min(canvas.width - obj.radius, newX)),
                        y: Math.max(obj.radius, Math.min(canvas.height - obj.radius, newY))
                    };
                });
            });
        };

        const render = () => {
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw game objects
            gameObjects.forEach(obj => {
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
                ctx.fillStyle = obj.color;
                ctx.fill();
                ctx.closePath();
            });

            // Update game objects
            updateGameObjects();

            // Continue animation loop
            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [canvasRef, gameObjects, setGameObjects, isPaused]);
};