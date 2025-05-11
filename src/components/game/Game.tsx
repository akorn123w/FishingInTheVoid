import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    CLICK_THRESHOLDS,
    CELL_DIVISION,
    ANIMATION,
    MOVEMENT,
    PARTICLES,
    FOOD,
    BACKGROUND,
    SPRING,
} from '../constants/gameConstants';
import { FEATURE_FLAGS } from '../constants/featureFlags';
import { Store } from './Store/Store';
import { StoreItem, STORE_ITEMS } from '../constants/storeItems';
import { StoreHandler } from '../handlers/StoreHandler';
import { ParticleHandler, Particle } from '../handlers/ParticleHandler';
import { handlePurchase } from './Store/storeLogic';
import { SquidExpression } from '../types/game';
import { SquidForm } from './SquidForm/SquidForm';
import { FoodParticle } from './FoodParticle/FoodParticle';
import { MorphingCell } from './MorphingCell';
import { FloatingNumber } from './FloatingNumber';
import { BackgroundCell } from './BackgroundCell';
import { calculateTotalClicks } from '../utils/clickCalculations';
import { makeCellShape } from '../utils/cellShapeUtils';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop';
import { useClickHandler } from '../hooks/useClickHandler';
import { useDevTools } from '../hooks/useDevTools';
import './Game.css';

interface Position {
    x: number;
    y: number;
}

interface Cell {
    id: number;
    x: number;
    y: number;
    angle: number;
    scale: number;
    isDividing: boolean;
    generation: number;
    parentId: number | null;
}

interface BackgroundCell {
    type: number;
    x: number;
    y: number;
    rotation: number;
    opacity: number;
}

interface FoodParticle {
    id: number;
    x: number;
    y: number;
    size: number;
    eaten: boolean;
    isBeingEaten: boolean;
    type: number;
    createdAt: number;
    opacity: number;
}

interface SquidMood {
    isHappy: boolean;
    happinessLevel: number;
}

export const Game: React.FC = () => {
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<HTMLDivElement>(null);
    const lastClickTime = useRef<number>(0);
    const jiggleRef = useRef(0);
    const jiggleVelocity = useRef(0);
    const nextNumberId = useRef(0);
    const nextFoodId = useRef(0);
    const storeHandlerRef = useRef<StoreHandler | null>(null);
    const particleHandlerRef = useRef<ParticleHandler | null>(null);
    const animationStarted = useRef(false);

    // Core game state
    const [clickCount, setClickCount] = useState(0);
    const [clickMultiplier, setClickMultiplier] = useState(1);
    const [clickBonus, setClickBonus] = useState(0);
    const [temporaryMultiplier, setTemporaryMultiplier] = useState(1);
    const [temporaryMultiplierTimeout, setTemporaryMultiplierTimeout] = useState<NodeJS.Timeout | null>(null);
    const [gameMode, setGameMode] = useState<'clicker' | 'movement'>('clicker');
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);

    // Store and purchase related state
    const [purchasedItems, setPurchasedItems] = useState<{ [key: string]: number }>({});
    const [animations, setAnimations] = useState<Animation[]>([]);

    // Cell and division related state
    const [cellPosition, setCellPosition] = useState({ x: 50, y: 50 });
    const [cellVelocity, setCellVelocity] = useState({ x: 0, y: 0 });
    const [cellDivision, setCellDivision] = useState(false);
    const [divisionProgress, setDivisionProgress] = useState(0);
    const [cells, setCells] = useState<Cell[]>([{
        id: 0,
        x: 0,
        y: 0,
        angle: 0,
        scale: 1,
        isDividing: false,
        generation: 0,
        parentId: null
    }]);
    const [groupRotation, setGroupRotation] = useState(0);
    const [internalRotation, setInternalRotation] = useState(0);
    const [groupScale, setGroupScale] = useState(1);
    const [cellClusterDivision, setCellClusterDivision] = useState(false);
    const [cellClusterProgress, setCellClusterProgress] = useState(0);
    const [cellClusterGrid, setCellClusterGrid] = useState<Array<{ x: number; y: number }>>([{ x: 0, y: 0 }]);

    // Background and visual effects state
    const [particles, setParticles] = useState<Particle[]>([]);
    const [backgroundCells, setBackgroundCells] = useState<BackgroundCell[]>([]);
    const [backgroundCellOpacity, setBackgroundCellOpacity] = useState(0);
    const [highlightFlash, setHighlightFlash] = useState(false);
    const [jiggleTarget, setJiggleTarget] = useState(0);
    const [jiggle, setJiggle] = useState(0);

    // Squid related state
    const [squidPosition, setSquidPosition] = useState({ x: 50, y: 50 });
    const [squidVelocity, setSquidVelocity] = useState({ x: 0, y: 0 });
    const [squidFormOpacity, setSquidFormOpacity] = useState(0);
    const [showSquidForm, setShowSquidForm] = useState(false);
    const [isSquidBlinking, setIsSquidBlinking] = useState(false);
    const [squidMood, setSquidMood] = useState<SquidMood>({ isHappy: false, happinessLevel: 0 });
    const [squidExpression, setSquidExpression] = useState<SquidExpression>('content');
    const [autoBlinkInterval, setAutoBlinkInterval] = useState<NodeJS.Timeout | null>(null);

    // Food and eating related state
    const [foodParticles, setFoodParticles] = useState<FoodParticle[]>([]);
    const [foodBeingEaten, setFoodBeingEaten] = useState<Set<number>>(new Set());
    const [targetFood, setTargetFood] = useState<FoodParticle | null>(null);
    const [targetFoodPosition, setTargetFoodPosition] = useState<{ x: number; y: number } | null>(null);

    // Animation and visual feedback state
    const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
    const [spiralProgress, setSpiralProgress] = useState(0);
    const [spiralAngle, setSpiralAngle] = useState(0);
    const [morphProgress, setMorphProgress] = useState(0);
    const [hasEvolved, setHasEvolved] = useState(false);

    // Camera and viewport state
    const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
    const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
    const [targetCameraPosition, setTargetCameraPosition] = useState({ x: 0, y: 0 });
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

    // Developer tools and logging state
    const [isDevMode, setIsDevMode] = useState(false);
    const [devLogs, setDevLogs] = useState<string[]>([]);
    const [objectLogs, setObjectLogs] = useState<{ [key: string]: { timestamp: string; message: string } }>({});
    const [loggingPreferences, setLoggingPreferences] = useState({
        squid: false,
        foodParticles: false
    });

    const {
        gameObjects,
        setGameObjects,
    } = useGameState();

    const { handleClick } = useClickHandler({
        clickCount,
        setClickCount,
        clickMultiplier,
        gameObjects,
        setGameObjects,
        objectLogs,
        setObjectLogs,
        setAnimations
    });

    const { handleKeyPress } = useDevTools({
        isDevMode,
        setIsDevMode,
        isPaused,
        setIsPaused,
        clickCount,
        setClickCount,
        clickMultiplier,
        setClickMultiplier
    });

    useGameLoop({
        canvasRef,
        gameObjects,
        setGameObjects,
        isPaused,
        objectLogs,
        setObjectLogs
    });

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const handlePurchase = (itemId: string) => {
        const item = STORE_ITEMS.find(i => i.id === itemId);
        if (!item) return;

        const currentLevel = purchasedItems[itemId] || 0;
        const cost = item.cost * Math.pow(item.costMultiplier, currentLevel);
        const totalClicks = calculateTotalClicks(clickCount, purchasedItems);

        if (totalClicks >= cost) {
            setClickCount(prev => prev - cost);
            setPurchasedItems(prev => ({
                ...prev,
                [itemId]: (prev[itemId] || 0) + 1
            }));
        }
    };

    const handleAnimationComplete = (id: string) => {
        setAnimations(prev => prev.filter(anim => anim.id !== id));
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Create cell shape animations
        const cells = makeCellShape(x, y, 20);
        cells.forEach((cell, index) => {
            setAnimations(prev => [
                ...prev,
                {
                    id: `cell-${Date.now()}-${index}`,
                    type: 'backgroundCell',
                    x: cell.x,
                    y: cell.y,
                    size: cell.size
                }
            ]);
        });

        // Create floating number animation
        setAnimations(prev => [
            ...prev,
            {
                id: `number-${Date.now()}`,
                type: 'floatingNumber',
                x,
                y,
                value: clickMultiplier
            }
        ]);

        // Create squid form animation
        setAnimations(prev => [
            ...prev,
            {
                id: `squid-${Date.now()}`,
                type: 'squidForm',
                x,
                y
            }
        ]);

        handleClick(event);
    };

    return (
        <div className="game-container" ref={canvasRef} data-game-container="true">
            <canvas
                ref={canvasRef}
                className="game-canvas"
                width={window.innerWidth}
                height={window.innerHeight}
                onClick={handleCanvasClick}
            />
            <ClickCounter clickCount={clickCount} />
            <Store
                clickCount={clickCount}
                purchasedItems={purchasedItems}
                onPurchase={handlePurchase}
            />
            {isDevMode && (
                <DevControls
                    clickMultiplier={clickMultiplier}
                    onMultiplierChange={setClickMultiplier}
                    objectLogs={objectLogs}
                />
            )}
            <AnimationManager
                animations={animations}
                onAnimationComplete={handleAnimationComplete}
            />
        </div>
    );
};