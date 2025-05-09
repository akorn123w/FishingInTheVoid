import React, { useState, useEffect, useRef } from 'react';
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

interface Position {
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  vx?: number;
  vy?: number;
  pushTime?: number;
}

interface Cell {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  isDividing: boolean;
  generation: number;
  parentId: number | null; // Track parent cell for connected structure
}

interface BackgroundCell {
  type: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  direction: number;
  opacity: number;
}

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: number;
  opacity: number;
}

interface FoodParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  eaten: boolean;
  type: number;
  createdAt: number;
  opacity: number;
}

// Add new interface for squid mood
interface SquidMood {
  isHappy: boolean;
  happinessLevel: number;
}

const SPRING_CONFIG = {
  stiffness: SPRING.STIFFNESS,
  damping: SPRING.DAMPING
};

// New component for the visual representation of the cell cluster
const CellClusterVisual: React.FC = () => {
  return (
    <svg
      width="300"
      height="300"
      viewBox="-50 -50 200 200"
      style={{
        filter: `drop-shadow(0 0 16px #4a90e2aa)`,
        transformOrigin: 'center center',
        transform: 'scale(3)',
        overflow: 'visible',
      }}
    >
      {/* Main body cluster */}
      <g>
        {/* Core cluster */}
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="45"
          fill="url(#cellGradient)"
          stroke="#4a90e2"
          strokeWidth="2"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="35"
          ry="35"
          fill="url(#coreGradient)"
        />

        {/* Connected cell structures */}
        <g>
          {/* Top cluster */}
          <ellipse
            cx="50"
            cy="20"
            rx="25"
            ry="25"
            fill="url(#cellGradient)"
            stroke="#4a90e2"
            strokeWidth="1.5"
          />
          <ellipse
            cx="50"
            cy="20"
            rx="20"
            ry="20"
            fill="url(#coreGradient)"
          />

          {/* Bottom cluster */}
          <ellipse
            cx="50"
            cy="80"
            rx="25"
            ry="25"
            fill="url(#cellGradient)"
            stroke="#4a90e2"
            strokeWidth="1.5"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="20"
            ry="20"
            fill="url(#coreGradient)"
          />

          {/* Left cluster */}
          <ellipse
            cx="20"
            cy="50"
            rx="25"
            ry="25"
            fill="url(#cellGradient)"
            stroke="#4a90e2"
            strokeWidth="1.5"
          />
          <ellipse
            cx="20"
            cy="50"
            rx="20"
            ry="20"
            fill="url(#coreGradient)"
          />

          {/* Right cluster */}
          <ellipse
            cx="80"
            cy="50"
            rx="25"
            ry="25"
            fill="url(#cellGradient)"
            stroke="#4a90e2"
            strokeWidth="1.5"
          />
          <ellipse
            cx="80"
            cy="50"
            rx="20"
            ry="20"
            fill="url(#coreGradient)"
          />
        </g>

        {/* Connecting structures */}
        <g>
          <path
            d="M50 25 L50 75"
            stroke="#4a90e2"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M25 50 L75 50"
            stroke="#4a90e2"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </g>

      {/* Gradients */}
      <defs>
        <radialGradient id="cellGradient" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#bfe6ff" />
          <stop offset="40%" stopColor="#6ba4e7" />
          <stop offset="70%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
        <radialGradient id="coreGradient" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#e0f7ff" />
          <stop offset="50%" stopColor="#8bb8f0" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
      </defs>
    </svg>
  );
};

// New component for different cell types
const BackgroundCell: React.FC<{
  type: number;
  x: number;
  y: number;
  rotation: number;
  style?: React.CSSProperties;
}> = ({ type, x, y, rotation, style }) => {
  const getCellColor = () => {
    switch (type) {
      case 1: return '#ff6b6b'; // Reddish
      case 2: return '#4ecdc4'; // Teal
      case 3: return '#ffe66d'; // Yellow
      case 4: return '#95e1d3'; // Mint
      default: return '#ff6b6b';
    }
  };

  const getCellShape = () => {
    switch (type) {
      case 1:
        return (
          <path
            d="M50 20 L80 50 L50 80 L20 50 Z"
            fill={getCellColor()}
            stroke="#ffffff33"
            strokeWidth="1"
          />
        );
      case 2:
        return (
          <path
            d="M50 20 Q80 50 50 80 Q20 50 50 20"
            fill={getCellColor()}
            stroke="#ffffff33"
            strokeWidth="1"
          />
        );
      case 3:
        return (
          <path
            d="M50 20 L65 35 L80 20 L65 5 L50 20"
            fill={getCellColor()}
            stroke="#ffffff33"
            strokeWidth="1"
          />
        );
      case 4:
        return (
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={getCellColor()}
            stroke="#ffffff33"
            strokeWidth="1"
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 100 100"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}rad)`,
        opacity: 0.6,
        filter: 'blur(1px)',
        ...style
      }}
    >
      {getCellShape()}
    </svg>
  );
};

// New component for the squid/Cthulhu form
const SquidForm: React.FC<{
  isBlinking?: boolean;
  isHappy?: boolean;
  expression?: 'content' | 'trying' | 'eating';
  scale?: number;
}> = ({ isBlinking = false, isHappy = false, expression = 'content', scale = 1 }) => {
  const [tentaclePhase, setTentaclePhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTentaclePhase(prev => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getMouthPath = () => {
    switch (expression) {
      case 'trying':
        return `M40 60 Q50 65 60 60`;
      case 'eating':
        return `M35 60 Q50 75 65 60`;
      case 'content':
      default:
        return `M40 60 Q50 70 60 60`;
    }
  };

  return (
    <svg
      width="300"
      height="300"
      viewBox="-50 -50 200 200"
      style={{
        filter: `drop-shadow(0 0 16px #4a90e2aa)`,
        transformOrigin: 'center center',
        transform: `scale(${scale})`,
        overflow: 'visible',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy animation
      }}
    >
      {/* Main body */}
      <g>
        {/* Head */}
        <ellipse
          cx="50"
          cy="50"
          rx="40"
          ry="35"
          fill="url(#cellGradient)"
          stroke="#4a90e2"
          strokeWidth="2"
        />

        {/* Eyes */}
        <g>
          <ellipse
            cx="35"
            cy="45"
            rx="8"
            ry={isBlinking ? "2" : "12"}
            fill="#2a4a8a"
            stroke="#4a90e2"
            strokeWidth="1"
            style={{ transition: 'ry 0.1s ease-out' }}
          />
          <ellipse
            cx="65"
            cy="45"
            rx="8"
            ry={isBlinking ? "2" : "12"}
            fill="#2a4a8a"
            stroke="#4a90e2"
            strokeWidth="1"
            style={{ transition: 'ry 0.1s ease-out' }}
          />
          <circle cx="35" cy="45" r="3" fill="#e0f7ff" />
          <circle cx="65" cy="45" r="3" fill="#e0f7ff" />
        </g>

        {/* Mouth */}
        <path
          d={getMouthPath()}
          stroke="#2a4a8a"
          strokeWidth="2"
          fill="none"
          style={{ transition: 'all 0.3s ease-out' }}
        />

        {/* Tentacles */}
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8;
            const startX = 50 + Math.cos(angle) * 40;
            const startY = 50 + Math.sin(angle) * 35;
            const waveOffset = Math.sin(tentaclePhase + i * 0.5) * 10;
            const endX = startX + Math.cos(angle) * (60 + waveOffset);
            const endY = startY + Math.sin(angle) * (60 + waveOffset);

            return (
              <path
                key={i}
                d={`M${startX} ${startY} Q${(startX + endX) / 2} ${(startY + endY) / 2} ${endX} ${endY}`}
                stroke="#4a90e2"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Suckers on tentacles */}
        <g>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8;
            const baseX = 50 + Math.cos(angle) * 40;
            const baseY = 50 + Math.sin(angle) * 35;
            const waveOffset = Math.sin(tentaclePhase + i * 0.5) * 10;

            return Array.from({ length: 4 }).map((_, j) => {
              const distance = 15 + j * 15;
              const x = baseX + Math.cos(angle) * (distance + waveOffset);
              const y = baseY + Math.sin(angle) * (distance + waveOffset);

              return (
                <circle
                  key={`${i}-${j}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#4a90e2"
                  stroke="#2a4a8a"
                  strokeWidth="0.5"
                />
              );
            });
          })}
        </g>
      </g>

      {/* Gradients */}
      <defs>
        <radialGradient id="cellGradient" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#bfe6ff" />
          <stop offset="40%" stopColor="#6ba4e7" />
          <stop offset="70%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
      </defs>
    </svg>
  );
};

const FloatingNumber: React.FC<{ number: FloatingNumber }> = ({ number }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${number.x}%`,
        top: `${number.y}%`,
        color: '#4a90e2',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 2px #000, 0 0 10px rgba(74, 144, 226, 0.5)',
        opacity: number.opacity,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        transition: 'all 0.5s ease-out',
      }}
    >
      +{number.value}
    </div>
  );
};

const FoodParticle: React.FC<{ particle: FoodParticle }> = ({ particle }) => {
  const getParticleColor = () => {
    switch (particle.type) {
      case 1: return '#ff6b6b'; // Reddish
      case 2: return '#4ecdc4'; // Teal
      case 3: return '#ffe66d'; // Yellow
      case 4: return '#95e1d3'; // Mint
      default: return '#ff6b6b';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}px`,
        height: `${particle.size}px`,
        background: getParticleColor(),
        borderRadius: '50%',
        opacity: particle.eaten ? 0 : particle.opacity,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease-out',
        filter: 'blur(1px)',
        boxShadow: '0 0 10px currentColor',
      }}
    />
  );
};

const MorphingCell: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <svg
      width="300"
      height="300"
      viewBox="-50 -50 200 200"
      style={{
        filter: `drop-shadow(0 0 16px #4a90e2aa)`,
        transformOrigin: 'center center',
        transform: 'scale(1)',
        overflow: 'visible',
      }}
    >
      <defs>
        <radialGradient id="cellGradient" cx="45%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#bfe6ff" />
          <stop offset="40%" stopColor="#6ba4e7" />
          <stop offset="70%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
      </defs>

      {/* Main body - morphs from circle to squid-like shape */}
      <g>
        <path
          d={`
            M50 ${50 - 45 * (1 - progress)}
            Q${50 + 45 * (1 - progress)} 50 50 ${50 + 45 * (1 - progress)}
            Q${50 - 45 * (1 - progress)} 50 50 ${50 - 45 * (1 - progress)}
            ${progress > 0.3 ? `
              M50 ${50 - 35}
              Q${50 + 35 + progress * 20} ${50 - 20} ${50 + 45 + progress * 30} 50
              Q${50 + 35 + progress * 20} ${50 + 20} 50 ${50 + 35}
              Q${50 - 35 - progress * 20} ${50 + 20} ${50 - 45 - progress * 30} 50
              Q${50 - 35 - progress * 20} ${50 - 20} 50 ${50 - 35}
            ` : ''}
          `}
          fill="url(#cellGradient)"
          stroke="#4a90e2"
          strokeWidth="2"
        />

        {/* Tentacles start appearing */}
        {progress > 0.5 && Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const startX = 50 + Math.cos(angle) * 40;
          const startY = 50 + Math.sin(angle) * 35;
          const tentacleProgress = (progress - 0.5) * 2;
          const endX = startX + Math.cos(angle) * (60 * tentacleProgress);
          const endY = startY + Math.sin(angle) * (60 * tentacleProgress);

          return (
            <path
              key={i}
              d={`M${startX} ${startY} Q${(startX + endX) / 2} ${(startY + endY) / 2} ${endX} ${endY}`}
              stroke="#4a90e2"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity={tentacleProgress}
            />
          );
        })}

        {/* Eyes start appearing */}
        {progress > 0.7 && (
          <g opacity={(progress - 0.7) * 3.33}>
            <ellipse
              cx="35"
              cy="45"
              rx="8"
              ry="12"
              fill="#2a4a8a"
              stroke="#4a90e2"
              strokeWidth="1"
            />
            <ellipse
              cx="65"
              cy="45"
              rx="8"
              ry="12"
              fill="#2a4a8a"
              stroke="#4a90e2"
              strokeWidth="1"
            />
            <circle cx="35" cy="45" r="3" fill="#e0f7ff" />
            <circle cx="65" cy="45" r="3" fill="#e0f7ff" />
          </g>
        )}
      </g>
    </svg>
  );
};

const Game: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameMode, setGameMode] = useState<'clicker' | 'movement'>('clicker');
  const [highlightFlash, setHighlightFlash] = useState(false);
  const [clickMultiplier, setClickMultiplier] = useState(1);
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
  const gameRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef<number>(0);

  // --- Smooth spring for jiggle ---
  const [jiggleTarget, setJiggleTarget] = useState(0);
  const jiggleRef = useRef(0);
  const [jiggle, setJiggle] = useState(0);
  const jiggleVelocity = useRef(0);

  const [time, setTime] = useState(0);

  const [hasEvolved, setHasEvolved] = useState(false);

  const [backgroundCells, setBackgroundCells] = useState<BackgroundCell[]>([]);
  const [cellClusterDivision, setCellClusterDivision] = useState(false);
  const [cellClusterProgress, setCellClusterProgress] = useState(0);
  const [cellClusterGrid, setCellClusterGrid] = useState<Array<{ x: number; y: number }>>([{ x: 0, y: 0 }]);

  const [backgroundCellOpacity, setBackgroundCellOpacity] = useState(0);
  const [showSquidForm, setShowSquidForm] = useState(false);
  const [squidFormOpacity, setSquidFormOpacity] = useState(0);

  const [viewportCenter, setViewportCenter] = useState({ x: 0, y: 0 });
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 });
  const [targetCameraPosition, setTargetCameraPosition] = useState({ x: 0, y: 0 });

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const [isSquidBlinking, setIsSquidBlinking] = useState(false);
  const [squidPosition, setSquidPosition] = useState({ x: 50, y: 50 });
  const [squidVelocity, setSquidVelocity] = useState({ x: 0, y: 0 });

  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const nextNumberId = useRef(0);

  const [foodParticles, setFoodParticles] = useState<FoodParticle[]>([]);
  const [targetFood, setTargetFood] = useState<FoodParticle | null>(null);
  const nextFoodId = useRef(0);

  const [morphProgress, setMorphProgress] = useState(0);

  // Add new state for squid mood
  const [squidMood, setSquidMood] = useState<SquidMood>({ isHappy: false, happinessLevel: 0 });
  const [autoBlinkInterval, setAutoBlinkInterval] = useState<NodeJS.Timeout | null>(null);

  // Add new state for target food position and squid expression
  const [targetFoodPosition, setTargetFoodPosition] = useState<{ x: number; y: number } | null>(null);
  const [squidExpression, setSquidExpression] = useState<'content' | 'trying' | 'eating'>('content');

  useEffect(() => {
    let running = true;
    function animate() {
      // Spring physics
      const displacement = jiggleTarget - jiggleRef.current;
      const springForce = displacement * SPRING_CONFIG.stiffness;
      jiggleVelocity.current = (jiggleVelocity.current + springForce) * SPRING_CONFIG.damping;
      jiggleRef.current += jiggleVelocity.current;
      setJiggle(jiggleRef.current);
      if (Math.abs(jiggleVelocity.current) > 0.001 || Math.abs(displacement) > 0.001) {
        requestAnimationFrame(animate);
      } else {
        jiggleRef.current = jiggleTarget;
        setJiggle(jiggleTarget);
      }
    }
    animate();
    return () => { running = false; };
    // eslint-disable-next-line
  }, [jiggleTarget]);

  // Update time for animations
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.02);
      // Rotate the group of cells
      if (clickCount >= 10000) {
        setGroupRotation(prev => prev + 0.002);
      }
      // Rotate internal parts
      setInternalRotation(prev => prev + 0.01);
    }, 16);
    return () => clearInterval(interval);
  }, [clickCount]);

  // Calculate viewport center on mount and resize
  useEffect(() => {
    const updateViewportCenter = () => {
      if (gameRef.current) {
        const rect = gameRef.current.getBoundingClientRect();
        setViewportCenter({
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
    };

    updateViewportCenter();
    window.addEventListener('resize', updateViewportCenter);
    return () => window.removeEventListener('resize', updateViewportCenter);
  }, []);

  // Update viewport size on mount and resize
  useEffect(() => {
    const updateViewportSize = () => {
      if (gameRef.current) {
        const rect = gameRef.current.getBoundingClientRect();
        setViewportSize({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Calculate cell scale based on viewport
  const getCellScale = () => {
    if (clickCount <= CLICK_THRESHOLDS.INITIAL) return 0.0001;

    if (clickCount >= CLICK_THRESHOLDS.PRE_EVOLUTION_START && clickCount <= CLICK_THRESHOLDS.PRE_EVOLUTION_END) {
      const progress = (clickCount - CLICK_THRESHOLDS.PRE_EVOLUTION_START) / 200;
      const maxScale = Math.min(viewportSize.width, viewportSize.height) / 200;
      const targetScale = maxScale * 0.15;
      return 0.0001 + (maxScale - 0.0001) * (1 - progress * 0.85);
    }

    if (clickCount > CLICK_THRESHOLDS.POST_EVOLUTION_START) {
      const maxScale = Math.min(viewportSize.width, viewportSize.height) / 200;
      const baseScale = maxScale * 0.15;
      return baseScale / Math.sqrt(cells.length);
    }

    // Simplified scaling for early clicks
    const baseScale = 0.0001;
    const maxScale = Math.min(viewportSize.width, viewportSize.height) / 200;
    const scale = baseScale + (clickCount / 1000) * (maxScale - baseScale);
    return Math.min(scale, maxScale);
  };

  // Calculate spread distance based on number of cells and generation
  const getSpreadDistance = (cell: Cell) => {
    const baseDistance = 60; // Base distance between cells
    const generationMultiplier = Math.pow(1.2, cell.generation); // Each generation spreads 20% further
    const cellCountMultiplier = Math.sqrt(cells.length) * 0.5; // Spread increases with more cells
    return baseDistance * generationMultiplier * cellCountMultiplier;
  };

  // Calculate position for a new cell based on its parent
  const calculateNewCellPosition = (parentCell: Cell, index: number, totalNewCells: number) => {
    const baseAngle = (2 * Math.PI * index) / totalNewCells; // Evenly distribute around parent
    const cellDiameter = 45; // Reduced from 90 to 45 to keep cells closer
    const overlap = 0.2; // 20% overlap between cells

    return {
      x: Math.cos(baseAngle) * cellDiameter * (1 - overlap),
      y: Math.sin(baseAngle) * cellDiameter * (1 - overlap),
      angle: baseAngle
    };
  };

  // Handle cell division animation
  useEffect(() => {
    if (cellDivision) {
      const duration = 1000; // 1 second animation
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setDivisionProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCellDivision(false);
          setDivisionProgress(0);
          // Double the number of cells
          setCells(prev => {
            const newCells = [...prev];
            // Mark all existing cells as not dividing
            newCells.forEach(cell => cell.isDividing = false);
            // Add new cells
            const newCellCount = prev.length;
            for (let i = 0; i < newCellCount; i++) {
              const parentCell = prev[i];
              const { x, y, angle } = calculateNewCellPosition(parentCell, i, newCellCount);
              newCells.push({
                id: prev.length + i,
                x,
                y,
                angle,
                scale: 0.95 + Math.random() * 0.1, // Very slight size variation
                isDividing: false,
                generation: parentCell.generation + 1,
                parentId: parentCell.id
              });
            }
            return newCells;
          });
        }
      };

      requestAnimationFrame(animate);
    }
  }, [cellDivision]);

  // Handle floating and bouncing behavior
  useEffect(() => {
    if (clickCount >= 10000) {
      const animate = () => {
        setCellPosition(prev => {
          const newX = prev.x + cellVelocity.x;
          const newY = prev.y + cellVelocity.y;

          // Bounce off edges
          let newVx = cellVelocity.x;
          let newVy = cellVelocity.y;

          if (newX <= 0 || newX >= 100) {
            newVx = -newVx * 0.8; // Bounce with energy loss
          }
          if (newY <= 0 || newY >= 100) {
            newVy = -newVy * 0.8; // Bounce with energy loss
          }

          // Add very slight random movement (reduced from 0.1 to 0.02)
          newVx += (Math.random() - 0.5) * 0.02;
          newVy += (Math.random() - 0.5) * 0.02;

          // Apply stronger drag (increased from 0.99 to 0.995)
          newVx *= 0.995;
          newVy *= 0.995;

          setCellVelocity({ x: newVx, y: newVy });

          return {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY))
          };
        });
      };

      const interval = setInterval(animate, 16);
      return () => clearInterval(interval);
    }
  }, [clickCount, cellVelocity]);

  // Initialize particles
  useEffect(() => {
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.2 + 0.1,
      angle: Math.random() * Math.PI * 2,
      vx: 0,
      vy: 0,
      pushTime: 0,
    }));
    setParticles(initialParticles);
  }, []);

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles(prev => prev.map(particle => {
        // If being pushed, animate velocity
        if (particle.pushTime && particle.pushTime > 0) {
          // Decay push over time
          const decay = 0.92;
          const vx = (particle.vx || 0) * decay;
          const vy = (particle.vy || 0) * decay;
          const pushTime = particle.pushTime - 1;
          return {
            ...particle,
            x: (particle.x + vx + 100) % 100,
            y: (particle.y + vy + 100) % 100,
            vx,
            vy,
            pushTime: pushTime > 0 ? pushTime : 0,
          };
        } else {
          // Normal floating
          return {
            ...particle,
            x: (particle.x + Math.cos(particle.angle) * particle.speed + 100) % 100,
            y: (particle.y + Math.sin(particle.angle) * particle.speed + 100) % 100,
            angle: particle.angle + (Math.random() - 0.5) * 0.1,
            vx: 0,
            vy: 0,
            pushTime: 0,
          };
        }
      }));
    };
    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize background cells with entrance animation
  useEffect(() => {
    if (clickCount >= 10050) {
      const cells = Array.from({ length: 20 }, () => {
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x = 0;
        let y = 0;
        switch (side) {
          case 0: // top
            x = Math.random() * 100;
            y = -20;
            break;
          case 1: // right
            x = 120;
            y = Math.random() * 100;
            break;
          case 2: // bottom
            x = Math.random() * 100;
            y = 120;
            break;
          case 3: // left
            x = -20;
            y = Math.random() * 100;
            break;
        }
        return {
          type: Math.floor(Math.random() * 4) + 1,
          x,
          y,
          rotation: Math.random() * Math.PI * 2,
          speed: 0.05 + Math.random() * 0.1,
          direction: Math.random() * Math.PI * 2,
          opacity: 0
        };
      });
      setBackgroundCells(cells);
    }
  }, [clickCount]);

  // Animate background cells with fade in
  useEffect(() => {
    if (clickCount >= 10050) {
      const interval = setInterval(() => {
        setBackgroundCells(prev => prev.map(cell => {
          const newX = cell.x + Math.cos(cell.direction) * cell.speed;
          const newY = cell.y + Math.sin(cell.direction) * cell.speed;
          const newOpacity = Math.min(0.6, cell.opacity + 0.01);

          return {
            ...cell,
            x: newX,
            y: newY,
            direction: cell.direction + (Math.random() - 0.5) * 0.02,
            opacity: newOpacity
          };
        }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [clickCount]);

  // Handle autonomous squid blinking
  useEffect(() => {
    if (clickCount >= 10100) {
      const interval = setInterval(() => {
        // Random blink every 2-4 seconds
        if (Math.random() < 0.1) { // 10% chance each check
          setIsSquidBlinking(true);
          setTimeout(() => setIsSquidBlinking(false), 100);
        }
      }, 100);
      setAutoBlinkInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [clickCount]);

  // Update squid movement logic
  useEffect(() => {
    if (clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
      const interval = setInterval(() => {
        setSquidPosition(prev => {
          const activeParticles = foodParticles.filter(p => !p.eaten);
          const viewportCenter = { x: 50, y: 50 };

          if (targetFoodPosition) {
            const dx = targetFoodPosition.x - prev.x;
            const dy = targetFoodPosition.y - prev.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Check for food collision with adjusted radius
            activeParticles.forEach(particle => {
              const foodDx = particle.x - prev.x;
              const foodDy = particle.y - prev.y;
              const foodDist = Math.sqrt(foodDx * foodDx + foodDy * foodDy);

              // Use a larger detection radius for visual accuracy
              if (foodDist < MOVEMENT.FOOD_DETECTION_RADIUS) {
                setFoodParticles(prev =>
                  prev.map(p => p.id === particle.id ? { ...p, eaten: true } : p)
                );
                setSquidExpression('eating');
                setTimeout(() => setSquidExpression('trying'), ANIMATION.BLINK_DURATION);
              }
            });

            // Only consider food reached when we're very close
            if (dist < MOVEMENT.CENTER_THRESHOLD) {
              setTargetFoodPosition(null);
              setSquidExpression('content');
              return prev;
            }

            const speed = MOVEMENT.SQUID_SPEED * 2;
            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;

            // Remove the overshoot factor for more precise movement
            const newX = prev.x + squidVelocity.x;
            const newY = prev.y + squidVelocity.y;

            setSquidVelocity(prevVel => ({
              x: prevVel.x * MOVEMENT.SQUID_VELOCITY_DAMPING + targetVx * MOVEMENT.SQUID_VELOCITY_INFLUENCE,
              y: prevVel.y * MOVEMENT.SQUID_VELOCITY_DAMPING + targetVy * MOVEMENT.SQUID_VELOCITY_INFLUENCE
            }));

            return {
              x: Math.max(0, Math.min(100, newX)),
              y: Math.max(0, Math.min(100, newY))
            };
          }

          if (activeParticles.length > 0) {
            setTargetFoodPosition({ x: activeParticles[0].x, y: activeParticles[0].y });
            setSquidExpression('trying');
            return prev;
          }

          // Make the squid swim back towards the center area when no food is present
          const dx = viewportCenter.x - prev.x;
          const dy = viewportCenter.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only start swimming back if we're far from center
          if (dist > MOVEMENT.CENTER_THRESHOLD * 2) {
            const speed = MOVEMENT.SQUID_IDLE_SPEED * 0.5; // Slower speed for idle swimming
            const targetVx = (dx / dist) * speed;
            const targetVy = (dy / dist) * speed;

            // Add some randomness to the movement
            const randomAngle = Math.random() * Math.PI * 2;
            const randomForce = Math.random() * 0.2;
            const randomVx = Math.cos(randomAngle) * randomForce;
            const randomVy = Math.sin(randomAngle) * randomForce;

            setSquidVelocity(prevVel => ({
              x: prevVel.x * MOVEMENT.SQUID_VELOCITY_DAMPING + (targetVx + randomVx) * MOVEMENT.SQUID_VELOCITY_INFLUENCE,
              y: prevVel.y * MOVEMENT.SQUID_VELOCITY_DAMPING + (targetVy + randomVy) * MOVEMENT.SQUID_VELOCITY_INFLUENCE
            }));

            const newX = prev.x + squidVelocity.x;
            const newY = prev.y + squidVelocity.y;

            return {
              x: Math.max(0, Math.min(100, newX)),
              y: Math.max(0, Math.min(100, newY))
            };
          }

          // When close to center, just drift slowly
          setSquidVelocity(prevVel => ({
            x: prevVel.x * 0.95,
            y: prevVel.y * 0.95
          }));

          const newX = prev.x + squidVelocity.x;
          const newY = prev.y + squidVelocity.y;

          return {
            x: Math.max(0, Math.min(100, newX)),
            y: Math.max(0, Math.min(100, newY))
          };
        });
      }, ANIMATION.MOVEMENT_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [clickCount, foodParticles, squidVelocity, targetFoodPosition]);

  // Initialize squid position when it first appears
  useEffect(() => {
    if (clickCount >= 10100) {
      setSquidPosition({ x: 50, y: 50 }); // Start at center
      setSquidVelocity({ x: 0, y: 0 });
      setSquidExpression('content');
    }
  }, [clickCount]);

  // Handle cell cluster division
  useEffect(() => {
    if (cellClusterDivision) {
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setCellClusterProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCellClusterDivision(false);
          setCellClusterProgress(0);
          // Create new grid positions
          setCellClusterGrid(prev => {
            const newGrid = [...prev];
            const gridSize = Math.sqrt(prev.length);
            const newSize = gridSize + 1;

            // Add new cells in a grid pattern
            for (let i = 0; i < newSize; i++) {
              for (let j = 0; j < newSize; j++) {
                if (i === newSize - 1 || j === newSize - 1) {
                  newGrid.push({
                    x: (i - (newSize - 1) / 2) * 100,
                    y: (j - (newSize - 1) / 2) * 100
                  });
                }
              }
            }
            return newGrid;
          });
        }
      };

      requestAnimationFrame(animate);
    }
  }, [cellClusterDivision]);

  // Calculate organelle opacity based on click count
  const getOrganelleOpacity = () => {
    if (clickCount >= 9800 && clickCount <= 10000) {
      const progress = (clickCount - 9800) / 200;
      // Smoother fade-out curve using cubic easing
      const easedProgress = progress * progress * (3 - 2 * progress);
      return Math.max(0, 1 - easedProgress);
    }
    return clickCount < 9800 ? 1 : 0;
  };

  // Calculate cell position based on its parent and generation
  const getCellPosition = (cell: Cell) => {
    if (cell.parentId === null) return { x: 0, y: 0 }; // Root cell is at center (0,0)

    const parentCell = cells.find(c => c.id === cell.parentId);
    if (!parentCell) return { x: 0, y: 0 };

    // Calculate position relative to parent
    const distance = 45; // Half of cell diameter
    const x = Math.cos(cell.angle) * distance; // Position relative to center
    const y = Math.sin(cell.angle) * distance; // Position relative to center

    return { x, y };
  };

  // Calculate the center of all cells
  const getCellsCenter = () => {
    if (cells.length === 0) return { x: 0, y: 0 };

    const sum = cells.reduce((acc, cell) => {
      const pos = getCellPosition(cell);
      return {
        x: acc.x + pos.x,
        y: acc.y + pos.y
      };
    }, { x: 0, y: 0 });

    return {
      x: sum.x / cells.length,
      y: sum.y / cells.length
    };
  };

  // Smooth camera movement
  useEffect(() => {
    const animateCamera = () => {
      setCameraPosition(prev => {
        const dx = targetCameraPosition.x - prev.x;
        const dy = targetCameraPosition.y - prev.y;

        // Smoother spring-like movement with increased speed
        const newX = prev.x + dx * 0.2;
        const newY = prev.y + dy * 0.2;

        // Continue animation if we're not close enough to target
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          requestAnimationFrame(animateCamera);
        }

        return { x: newX, y: newY };
      });
    };

    // Only animate camera if we haven't reached squid transformation
    if (clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
      animateCamera();
    }
  }, [targetCameraPosition, clickCount]);

  // Smooth transition at 10001
  useEffect(() => {
    if (clickCount >= 10000 && clickCount < 10050) {
      const progress = (clickCount - 10000) / 50;
      setBackgroundCellOpacity(Math.min(1, progress * 2));
    }
  }, [clickCount]);

  // Transition to squid form
  useEffect(() => {
    if (clickCount >= 10100 && !showSquidForm) { // Only play animation when squid first appears
      // Start with a squished scale and animate to full size
      setSquidFormOpacity(0);
      setShowSquidForm(true);

      // Animate the opacity and scale
      const startTime = Date.now();
      const duration = 1000; // 1 second animation

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Use a bouncy easing function
        const bounce = (t: number) => {
          const c4 = (2 * Math.PI) / 3;
          return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        };

        const easedProgress = bounce(progress);
        setSquidFormOpacity(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else if (clickCount >= 10100 && showSquidForm) {
      // If squid is already shown, just set opacity to 1
      setSquidFormOpacity(1);
    }
  }, [clickCount, showSquidForm]);

  // Calculate morph progress
  useEffect(() => {
    if (clickCount >= 10050 && clickCount < 10100) {
      const progress = (clickCount - 10050) / 50;
      setMorphProgress(progress);
    } else if (clickCount >= 10100) {
      setMorphProgress(1);
    }
  }, [clickCount]);

  // Update food particles
  useEffect(() => {
    const interval = setInterval(() => {
      setFoodParticles(prev => {
        // Remove eaten particles
        const remainingParticles = prev.filter(p => !p.eaten);

        // If we're at the limit, remove the oldest particle
        if (remainingParticles.length >= FOOD.MAX_PARTICLES) {
          return remainingParticles.slice(1);
        }

        return remainingParticles;
      });
    }, ANIMATION.MOVEMENT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Handle click with floating numbers and food drops
  const handleClick = (e: React.MouseEvent) => {
    // Add click cooldown check
    const now = Date.now();
    const CLICK_COOLDOWN = 100; // 100ms between clicks (10 clicks per second max)
    if (now - lastClickTime.current < CLICK_COOLDOWN) {
      return; // Ignore click if too soon
    }
    lastClickTime.current = now;

    const rect = gameRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Add floating number
      const newNumber: FloatingNumber = {
        id: nextNumberId.current++,
        x,
        y,
        value: clickMultiplier,
        opacity: 1
      };

      setFloatingNumbers(prev => [...prev, newNumber]);

      setTimeout(() => {
        setFloatingNumbers(prev =>
          prev.map(n =>
            n.id === newNumber.id
              ? { ...n, y: n.y - 10, opacity: 0 }
              : n
          )
        );
      }, 50);

      setTimeout(() => {
        setFloatingNumbers(prev => prev.filter(n => n.id !== newNumber.id));
      }, 500);

      // Add food particle if we're in squid phase and haven't reached the limit
      if (clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
        setFoodParticles(prev => {
          const currentParticles = prev.filter(p => !p.eaten);
          if (currentParticles.length >= FOOD.MAX_PARTICLES) {
            return prev;
          }

          return [
            ...prev,
            {
              id: Date.now(),
              x,
              y,
              size: Math.random() * (FOOD.MAX_SIZE - FOOD.MIN_SIZE) + FOOD.MIN_SIZE,
              type: Math.floor(Math.random() * FOOD.TYPES) + 1,
              eaten: false,
              opacity: 1,
              createdAt: Date.now()
            }
          ];
        });
      }

      // Increment click count and handle cell division
      setClickCount(prev => {
        const newCount = prev + clickMultiplier;

        if (newCount >= CLICK_THRESHOLDS.POST_EVOLUTION_START &&
          newCount < CLICK_THRESHOLDS.CELL_DIVISION_END &&
          newCount % CELL_DIVISION.CLICKS_PER_DIVISION === 0) {
          setCellDivision(true);
          setCells(prev => prev.map(cell => ({ ...cell, isDividing: true })));
        }

        return newCount;
      });

      // Only apply cell click animation and camera centering before squid transformation
      if (clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
        setJiggleTarget(1.2);
        setHighlightFlash(true);
        setTimeout(() => setJiggleTarget(-0.7), 120);
        setTimeout(() => setJiggleTarget(0.3), 220);
        setTimeout(() => setJiggleTarget(0), 400);
        setTimeout(() => setHighlightFlash(false), 120);

        // Update camera position to center on click
        setTargetCameraPosition({ x, y });
      }
    }
  };

  // Render cell group with morphing animation
  const renderCellGroup = () => {
    if (clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
      return (
        <div style={{
          position: 'absolute',
          left: `${squidPosition.x}%`,
          top: `${squidPosition.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '300px', // Fixed size for squid
          height: '300px',
        }}>
          <SquidForm
            isBlinking={isSquidBlinking}
            isHappy={squidMood.isHappy}
            expression={squidExpression}
            scale={squidFormOpacity * 2}
          />
        </div>
      );
    }

    if (clickCount >= 10050) {
      return (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '300px', // Fixed size for morphing
          height: '300px',
        }}>
          <MorphingCell progress={morphProgress} />
        </div>
      );
    }

    // For cells before 10050, use a single SVG with groups
    const svgSize = Math.min(viewportSize.width, viewportSize.height) * 0.2;
    return (
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="-50 -50 100 100"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          filter: `drop-shadow(0 0 16px #4a90e2aa)`,
          transform: `
            translate(-50%, -50%)
            scale(${1 + jiggle * 0.1})
            ${highlightFlash ? 'filter: brightness(1.5)' : ''}
          `,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center center',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id="cellGradient" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#bfe6ff" />
            <stop offset="40%" stopColor="#6ba4e7" />
            <stop offset="70%" stopColor="#4a90e2" />
            <stop offset="100%" stopColor="#2a4a8a" />
          </radialGradient>
          <radialGradient id="coreGradient" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#e0f7ff" />
            <stop offset="50%" stopColor="#8bb8f0" />
            <stop offset="100%" stopColor="#2a4a8a" />
          </radialGradient>
        </defs>

        {cells.map((cell, index) => {
          const position = getCellPosition(cell);
          return (
            <g
              key={cell.id}
              transform={`
                translate(${position.x}, ${position.y})
                scale(${cell.scale})
                ${cell.isDividing ? `
                  scale(${1 + Math.sin(divisionProgress * Math.PI) * 0.2})
                  translate(${Math.sin(divisionProgress * Math.PI) * 20}, 0)
                ` : ''}
              `}
              style={{
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: 'center center'
              }}
            >
              <g transform="translate(0, 0)" style={{ transformOrigin: 'center center' }}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx="45"
                  ry="45"
                  fill="url(#cellGradient)"
                  stroke="#4a90e2"
                  strokeWidth="2"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="35"
                  ry="35"
                  fill="url(#coreGradient)"
                />

                {clickCount < 9800 && (
                  <g
                    style={{
                      opacity: getOrganelleOpacity(),
                      transform: `rotate(${internalRotation}rad)`,
                      transformOrigin: 'center center',
                      transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
                    }}
                  >
                    {/* ... organelle elements ... */}
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  // Main cell container
  return (
    <div
      ref={gameRef}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Developer Controls */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setClickMultiplier(prev => {
              switch (prev) {
                case 1: return 99;
                case 99: return 100;
                case 100: return 1000;
                case 1000: return 5000;
                default: return 1;
              }
            });
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            color: clickMultiplier > 1 ? '#ffffff' : '#999999',
            background: clickMultiplier > 1 ? '#4a90e2' : 'transparent',
            border: '2px solid #4a90e2',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-out',
          }}
        >
          Click Multiplier: x{clickMultiplier.toLocaleString()}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setGameMode(prev => prev === 'clicker' ? 'movement' : 'clicker');
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            color: '#ffffff',
            background: 'transparent',
            border: '2px solid #4a90e2',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.2s ease-out',
          }}
        >
          Switch to {gameMode === 'clicker' ? 'Movement' : 'Clicker'} Mode
        </button>
      </div>

      {/* Petri dish background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(74, 144, 226, 0.1), rgba(26, 26, 26, 0.3))',
          border: '2px solid rgba(74, 144, 226, 0.3)',
          boxShadow: 'inset 0 0 50px rgba(74, 144, 226, 0.2)',
        }}
      >
        {/* Floating particles */}
        {particles.map(particle => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'rgba(74, 144, 226, 0.3)',
              borderRadius: '50%',
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* Background cells with opacity */}
      {clickCount >= 10050 && backgroundCells.map((cell, index) => (
        <BackgroundCell
          key={index}
          type={cell.type}
          x={cell.x}
          y={cell.y}
          rotation={cell.rotation}
          style={{
            opacity: cell.opacity,
            transition: 'opacity 0.5s ease-out'
          }}
        />
      ))}

      {/* Floating numbers - now on top layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
        {floatingNumbers.map(number => (
          <FloatingNumber key={number.id} number={number} />
        ))}
      </div>

      {/* Food particles */}
      {clickCount >= 10100 && foodParticles.map(particle => (
        <FoodParticle key={particle.id} particle={particle} />
      ))}

      {/* Main cell container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION
            ? `
              translate(-50%, -50%)
              scale(${getCellScale()})
              rotate(${groupRotation}rad)
            `
            : 'translate(-50%, -50%)', // After squid transformation, only center the container
          width: clickCount >= 10050 ? '300px' : `${Math.min(viewportSize.width, viewportSize.height) * 0.2}px`,
          height: clickCount >= 10050 ? '300px' : `${Math.min(viewportSize.width, viewportSize.height) * 0.2}px`,
          transition: clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION
            ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'none',
          transformOrigin: 'center center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {renderCellGroup()}
      </div>

      {/* Click counter */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          color: '#ffffff',
          fontSize: '24px',
          textShadow: '0 0 10px rgba(74, 144, 226, 0.5)',
        }}
      >
        Clicks: {clickCount}
      </div>
    </div>
  );
};

export default Game;