import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CLICK_THRESHOLDS,
  CELL_DIVISION,
  ANIMATION,
  PARTICLES,
  FOOD,
  BACKGROUND,
  SPRING,
} from '../constants/gameConstants';
import { FEATURE_FLAGS } from '../constants/featureFlags';
import { Store } from './Store/Store';
import { StoreItem, STORE_ITEMS } from '../constants/storeItems';
import { StoreHandler, StoreHandlerState } from '../handlers/StoreHandler';
import { ParticleHandler } from '../handlers/ParticleHandler';
import { handlePurchase } from './Store/storeLogic';
import { SquidExpression, FoodParticle } from '../types/game';
import BackgroundCell from './BackgroundCell';
import FloatingNumber from './FloatingNumber';
import FoodParticleComponent from './FoodParticle';
import { PurchasedItems } from './PurchasedItems/PurchasedItems';
import { SatietyMeter } from './SatietyMeter/SatietyMeter';

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

// Add new interface for squid mood
interface SquidMood {
  isHappy: boolean;
  happinessLevel: number;
}

interface GameState {
  clickCount: number;
  clickBonus: number;
  clickMultiplier: number;
  purchasedItems: { [key: string]: number };
  autoClickers: number;
}

// Add Particle interface
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  eaten?: boolean;
  isBeingEaten?: boolean;
  type?: number;
  createdAt?: number;
  speed?: number;
  angle?: number;
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

        {/* New gradients for organelles */}
        <radialGradient id="organelleGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
        <radialGradient id="particleGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#4a90e2" />
        </radialGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4a90e2" stopOpacity="0" />
        </radialGradient>

        {/* Animation keyframes */}
        <style>
          {`
            @keyframes organellePulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
            }
            @keyframes particleGlow {
              0%, 100% { transform: scale(1); opacity: 0.6; }
              50% { transform: scale(1.2); opacity: 1; }
            }
            @keyframes ringPulse {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.1); opacity: 0.6; }
            }
          `}
        </style>
      </defs>
    </svg>
  );
};

// New component for the squid/Cthulhu form
const SquidForm: React.FC<{
  isBlinking?: boolean;
  isHappy?: boolean;
  expression?: SquidExpression;
  scale?: number;
  satiety?: {
    current: number;
    max: number;
    level: number;
  };
  onSatietyLevelUp?: () => void;
}> = ({ isBlinking = false, isHappy = false, expression = 'content', scale = 1, satiety, onSatietyLevelUp }) => {
  const [tentaclePhase, setTentaclePhase] = useState(0);
  const [suckIntensity, setSuckIntensity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTentaclePhase(prev => (prev + 0.1) % (Math.PI * 2));
      if (expression === 'sucking') {
        setSuckIntensity(prev => (prev + 0.1) % 1);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [expression]);

  const getMouthPath = () => {
    switch (expression) {
      case 'sucking':
        // Circular sucking mouth with inner and outer paths
        return `
          M35 60
          C35 60, 40 45, 50 45
          C60 45, 65 60, 65 60
          C65 60, 60 75, 50 75
          C40 75, 35 60, 35 60
          M40 60
          C40 60, 45 50, 50 50
          C55 50, 60 60, 60 60
          C60 60, 55 70, 50 70
          C45 70, 40 60, 40 60
        `;
      case 'content':
      default:
        return `M40 60
                C40 60, 45 65, 50 70
                C55 65, 60 60, 60 60
                C60 60, 55 65, 50 70
                C45 65, 40 60, 40 60`;
    }
  };

  const getEyeShape = () => {
    switch (expression) {
      case 'sucking':
        return {
          leftEye: { rx: 8, ry: 4 }, // Squinted eyes for intense sucking
          rightEye: { rx: 8, ry: 4 }
        };
      case 'content':
      default:
        return {
          leftEye: { rx: 8, ry: 12 },
          rightEye: { rx: 8, ry: 12 }
        };
    }
  };

  const eyeShape = getEyeShape();

  // Calculate shake effect for sucking
  const shakeOffset = expression === 'sucking'
    ? Math.sin(suckIntensity * Math.PI * 2) * 2
    : 0;

  return (
    <svg
      width="300"
      height="300"
      viewBox="-50 -50 200 200"
      style={{
        filter: `drop-shadow(0 0 16px #4a90e2aa)`,
        transformOrigin: 'center center',
        transform: `scale(${scale}) translate(${shakeOffset}px, ${shakeOffset}px)`,
        overflow: 'visible',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
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

        {/* Cheeks - only visible during sucking */}
        {expression === 'sucking' && (
          <>
            <ellipse
              cx="35"
              cy="55"
              rx="15"
              ry="10"
              fill="#ff6b6b"
              fillOpacity={0.3 + Math.sin(suckIntensity * Math.PI) * 0.2}
              style={{ transition: 'all 0.3s ease-out' }}
            />
            <ellipse
              cx="65"
              cy="55"
              rx="15"
              ry="10"
              fill="#ff6b6b"
              fillOpacity={0.3 + Math.sin(suckIntensity * Math.PI) * 0.2}
              style={{ transition: 'all 0.3s ease-out' }}
            />
          </>
        )}

        {/* Eyes */}
        <g>
          <ellipse
            cx="35"
            cy="45"
            rx={isBlinking ? "8" : eyeShape.leftEye.rx}
            ry={isBlinking ? "2" : eyeShape.leftEye.ry}
            fill="#2a4a8a"
            stroke="#4a90e2"
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease-out' }}
          />
          <ellipse
            cx="65"
            cy="45"
            rx={isBlinking ? "8" : eyeShape.rightEye.rx}
            ry={isBlinking ? "2" : eyeShape.rightEye.ry}
            fill="#2a4a8a"
            stroke="#4a90e2"
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease-out' }}
          />
          <circle cx="35" cy="45" r="3" fill="#e0f7ff" />
          <circle cx="65" cy="45" r="3" fill="#e0f7ff" />
        </g>

        {/* Mouth */}
        <path
          d={getMouthPath()}
          stroke="#2a4a8a"
          strokeWidth="2"
          fill="#2a4a8a"
          fillOpacity="0.3"
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

      {/* Add SatietyMeter */}
      {satiety && onSatietyLevelUp && (
        <foreignObject x="0" y="120" width="100" height="40">
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '5px'
          }}>
            <SatietyMeter
              currentSatiety={satiety.current}
              maxSatiety={satiety.max}
              level={satiety.level}
              onLevelUp={onSatietyLevelUp}
            />
          </div>
        </foreignObject>
      )}

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

        {/* New gradients for auto-clicker parts */}
        <radialGradient id="autoClickerCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#4a90e2" />
          <stop offset="100%" stopColor="#2a4a8a" />
        </radialGradient>
        <radialGradient id="autoClickerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4a90e2" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="autoClickerParticle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#4a90e2" />
        </radialGradient>

        {/* New animations for auto-clicker parts */}
        <style>
          {`
            @keyframes autoClickerRotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes autoClickerPulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.1); opacity: 1; }
            }
            @keyframes autoClickerGlow {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.6; }
            }
            @keyframes autoClickerParticleEmit {
              0% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1); opacity: 1; }
              100% { transform: scale(0); opacity: 0; }
            }
          `}
        </style>
      </defs>
    </svg>
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

  // Add eating behavior states
  const [foodBeingEaten, setFoodBeingEaten] = useState<Set<number>>(new Set());

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
  const [squidExpression, setSquidExpression] = useState<SquidExpression>('content');

  const [purchasedItems, setPurchasedItems] = useState<{ [key: string]: number }>({});
  const [clickBonus, setClickBonus] = useState(0);
  const [temporaryMultiplier, setTemporaryMultiplier] = useState(1);
  const [temporaryMultiplierTimeout, setTemporaryMultiplierTimeout] = useState<NodeJS.Timeout | null>(null);

  // Create store handler
  const storeHandlerRef = useRef<StoreHandler | null>(null);

  // Add state for developer logs
  const [devLogs, setDevLogs] = useState<string[]>([]);

  // Add state for logging preferences
  const [loggingPreferences, setLoggingPreferences] = useState({
    squid: false,
    foodParticles: false
  });

  // Add state to track object logs
  const [objectLogs, setObjectLogs] = useState<{
    [key: string]: {
      message: string;
      timestamp: string;
    }
  }>({});

  // Add new state for dev tools visibility
  const [showDevTools, setShowDevTools] = useState(false);

  // Add new state for auto-clickers
  const [autoClickers, setAutoClickers] = useState(0);
  const [internalParts, setInternalParts] = useState<Array<{ id: number; rotation: number }>>([]);

  // Add missing state variables
  const [satiety, setSatiety] = useState({
    current: 0,
    max: 100,
    level: 0
  });

  // Initialize particle handler
  const particleHandlerRef = useRef<ParticleHandler | null>(null);

  useEffect(() => {
    particleHandlerRef.current = new ParticleHandler(
      {
        particles: [],
        isAnimating: true,
        lastUpdateTime: Date.now()
      },
      {
        onParticleUpdate: (updatedParticles) => {
          setParticles(updatedParticles);
        },
        onStateChange: (newState) => {
          console.log('Particle state changed:', newState);
        },
        onError: (error) => {
          console.error('Particle handler error:', error);
        }
      }
    );

    return () => {
      if (particleHandlerRef.current) {
        particleHandlerRef.current.cleanup();
      }
    };
  }, []);

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + Shift + D
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault(); // Prevent default browser behavior
        setShowDevTools(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add function to update object logs
  const updateObjectLog = (objectId: string, message: string, category: 'squid' | 'foodParticles') => {
    if (FEATURE_FLAGS.DEVELOPMENT && loggingPreferences[category]) {
      setObjectLogs(prev => ({
        ...prev,
        [objectId]: {
          message: `[${category.toUpperCase()}] ${message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  // Add logging for squid state changes
  useEffect(() => {
    if (loggingPreferences.squid) {
      updateObjectLog(
        'squid',
        `Position: (${squidPosition.x.toFixed(2)}, ${squidPosition.y.toFixed(2)}), Scale: ${squidFormOpacity.toFixed(2)}, Expression: ${squidExpression}`,
        'squid'
      );
    }
  }, [squidPosition, squidFormOpacity, squidExpression, loggingPreferences.squid]);

  // Add logging for food particles
  useEffect(() => {
    if (loggingPreferences.foodParticles) {
      foodParticles.forEach(particle => {
        if (!particle.eaten) {
          updateObjectLog(
            `particle-${particle.id}`,
            `Pos(${particle.x.toFixed(2)}, ${particle.y.toFixed(2)}), Size: ${particle.size}, BeingEaten: ${particle.isBeingEaten}`,
            'foodParticles'
          );
        }
      });
    }
  }, [foodParticles, loggingPreferences.foodParticles]);

  // Initialize store handler
  useEffect(() => {
    storeHandlerRef.current = new StoreHandler({
      setClickCount,
      setClickBonus,
      setClickMultiplier,
      setTemporaryMultiplier,
      setPurchasedItems,
      setTemporaryMultiplierTimeout,
      setAutoClickers,
      onStateChange: (newState: Partial<StoreHandlerState>) => {
        console.log('Store state changed:', newState);
      },
      onError: (error: Error) => {
        console.error('Store handler error:', error);
      }
    });

    return () => {
      if (storeHandlerRef.current) {
        storeHandlerRef.current.cleanup();
      }
    };
  }, []); // Empty dependency array since we only want to create the handler once

  // Sync handler state with component state
  useEffect(() => {
    if (storeHandlerRef.current) {
      storeHandlerRef.current.updateHandlerState({
        isActive: true,
        clickCount,
        clickBonus,
        clickMultiplier,
        temporaryMultiplier,
        purchasedItems,
        autoClickers,
        timestamp: Date.now()
      });
    }
  }, [clickCount, clickBonus, clickMultiplier, temporaryMultiplier, purchasedItems, autoClickers]);

  // Handle store purchases
  const handleStorePurchase = (item: StoreItem) => {
    if (storeHandlerRef.current) {
      const result = storeHandlerRef.current.handleEvent(item);
      if (result?.autoClickers !== undefined) {
        setAutoClickers(result.autoClickers);
      }
      if (result?.clickBonus !== undefined) {
        setClickBonus(result.clickBonus);
      }
      if (result?.clickMultiplier !== undefined) {
        setClickMultiplier(result.clickMultiplier);
      }
      if (result?.clickCount !== undefined) {
        setClickCount(result.clickCount);
      }
      if (result?.purchasedItems) {
        setPurchasedItems(result.purchasedItems);
      }
    }
  };

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
      // Keep the cell centered without updating position
      // setCellPosition({ x: 50, y: 50 }); // Remove this line
    }
  }, [clickCount]);

  // Remove camera movement
  useEffect(() => {
    // Keep camera centered
    setCameraPosition({ x: 0, y: 0 });
    setTargetCameraPosition({ x: 0, y: 0 });
  }, []);

  // Calculate total clicks from all sources
  const calculateTotalClicks = () => {
    const baseClicks = 1 + clickBonus; // Base click (1) + permanent bonus
    const total = baseClicks * clickMultiplier * temporaryMultiplier;
    return Math.ceil(total); // Always round up to ensure minimum of 1 click
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

  // Update food particle creation to include speed and angle
  const handleClick = (e: React.MouseEvent) => {
    // Check if click is within developer controls or store
    const target = e.target as HTMLElement;
    const isDevArea = target.closest('[data-dev-area="true"]') !== null;
    const isStoreArea = target.closest('[data-store-area="true"]') !== null;

    // If click is in dev area or store area, don't process game click
    if (isDevArea || isStoreArea) {
      return;
    }

    // Add click cooldown check
    const now = Date.now();
    if (now - lastClickTime.current < CLICK_THRESHOLDS.CLICK_COOLDOWN) {
      return; // Ignore click if too soon
    }
    lastClickTime.current = now;

    const rect = gameRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Push particles on click
      if (particleHandlerRef.current) {
        particleHandlerRef.current.pushParticles(x, y);
      }

      // Add floating number with total clicks
      const newNumber: FloatingNumber = {
        id: nextNumberId.current++,
        x,
        y,
        value: calculateTotalClicks(),
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

          const newParticle: FoodParticle = {
            id: nextFoodId.current++,
            x,
            y,
            size: Math.random() * (FOOD.MAX_SIZE - FOOD.MIN_SIZE) + FOOD.MIN_SIZE,
            type: Math.floor(Math.random() * FOOD.TYPES) + 1,
            eaten: false,
            isBeingEaten: false,
            opacity: 1,
            createdAt: Date.now(),
            speed: Math.random() * 2 + 1, // Random speed between 1 and 3
            angle: Math.random() * Math.PI * 2 // Random angle in radians
          };
          return [...prev, newParticle];
        });

        // Check for sucking behavior after adding new particle
        handleSuckingBehavior();
      }

      // Increment click count with total clicks
      setClickCount(prev => {
        const newCount = prev + calculateTotalClicks();

        if (newCount >= CLICK_THRESHOLDS.POST_EVOLUTION_START &&
          newCount < CLICK_THRESHOLDS.CELL_DIVISION_END &&
          newCount % CELL_DIVISION.CLICKS_PER_DIVISION === 0) {
          setCellDivision(true);
          setCells(prev => prev.map(cell => ({ ...cell, isDividing: true })));
        }

        return newCount;
      });

      // Only apply cell click animation before squid transformation
      if (clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
        setJiggleTarget(1.2);
        setHighlightFlash(true);
        setTimeout(() => setJiggleTarget(-0.7), 120);
        setTimeout(() => setJiggleTarget(0.3), 220);
        setTimeout(() => setJiggleTarget(0), 400);
        setTimeout(() => setHighlightFlash(false), 120);
      }
    }
  };

  // Render cell group with morphing animation
  const renderCellGroup = () => {
    if (clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
      return null; // Remove the SquidForm from here since we render it at the bottom
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
                    {/* Organelle elements with enhanced animations */}
                    <g className="organelle-container">
                      {/* Core organelle */}
                      <circle
                        cx="0"
                        cy="0"
                        r="15"
                        fill="url(#organelleGradient)"
                        style={{
                          animation: 'organellePulse 3s infinite ease-in-out',
                          transformOrigin: 'center center',
                        }}
                      />

                      {/* Orbiting particles */}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <circle
                          key={i}
                          cx={Math.cos(time + (i * Math.PI * 2) / 3) * 25}
                          cy={Math.sin(time + (i * Math.PI * 2) / 3) * 25}
                          r="5"
                          fill="url(#particleGradient)"
                          style={{
                            animation: 'particleGlow 2s infinite ease-in-out',
                            animationDelay: `${i * 0.6}s`,
                          }}
                        />
                      ))}

                      {/* Glowing rings */}
                      <circle
                        cx="0"
                        cy="0"
                        r="20"
                        fill="none"
                        stroke="url(#glowGradient)"
                        strokeWidth="2"
                        style={{
                          animation: 'ringPulse 4s infinite ease-in-out',
                        }}
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="25"
                        fill="none"
                        stroke="url(#glowGradient)"
                        strokeWidth="1"
                        style={{
                          animation: 'ringPulse 4s infinite ease-in-out',
                          animationDelay: '1s',
                        }}
                      />
                    </g>
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  // Handle auto-clicking
  useEffect(() => {
    if (autoClickers === 0) return;

    const interval = setInterval(() => {
      // Calculate total clicks from auto-clickers
      const baseClicks = autoClickers;
      const bonusClicks = clickBonus;
      const totalClicks = Math.floor((baseClicks + bonusClicks) * clickMultiplier * temporaryMultiplier);

      setClickCount(prev => prev + totalClicks);
    }, 2000);

    return () => clearInterval(interval);
  }, [autoClickers, clickBonus, clickMultiplier, temporaryMultiplier]);

  // Update internal parts when auto-clickers change
  useEffect(() => {
    const newParts = Array.from({ length: autoClickers }, (_, i) => ({
      id: i,
      rotation: (i * (360 / Math.max(1, autoClickers))) % 360
    }));
    setInternalParts(newParts);
  }, [autoClickers]);

  // Handle satiety level up
  const handleSatietyLevelUp = () => {
    setSatiety(prev => {
      const newLevel = prev.level + 1;
      // Progressive max satiety increase based on level
      let maxIncrease;
      if (newLevel <= 3) {
        maxIncrease = 1.1; // 10% increase for early levels
      } else if (newLevel <= 6) {
        maxIncrease = 1.3; // 30% increase for mid levels
      } else if (newLevel <= 8) {
        maxIncrease = 1.5; // 50% increase for higher levels
      } else {
        maxIncrease = 1.8; // 80% increase for level 9+
      }
      return {
        current: 0,
        max: Math.floor(prev.max * maxIncrease),
        level: newLevel
      };
    });
  };

  // Handle sucking behavior
  const handleSuckingBehavior = useCallback(() => {
    if (clickCount < CLICK_THRESHOLDS.SQUID_TRANSFORMATION) return;

    if (squidExpression !== 'content') {
      console.log('Squid is already sucking, ignoring new particles');
      return;
    }

    const availableFood = foodParticles.filter(particle =>
      !particle.eaten && !foodBeingEaten.has(particle.id)
    );

    if (availableFood.length >= FOOD.MIN_PARTICLES_FOR_SUCK) {
      console.log(`Found ${availableFood.length} available food particles, starting sucking animation`);

      setSquidExpression('sucking');

      const newFoodBeingEaten = new Set(foodBeingEaten);
      availableFood.forEach(food => {
        newFoodBeingEaten.add(food.id);
      });
      setFoodBeingEaten(newFoodBeingEaten);

      setFoodParticles(prev =>
        prev.map(particle => {
          if (newFoodBeingEaten.has(particle.id)) {
            console.log(`Starting spiral animation for particle ${particle.id} at (${particle.x}, ${particle.y})`);
            return { ...particle, isBeingEaten: true };
          }
          return particle;
        })
      );

      setTimeout(() => {
        console.log('Sucking animation complete, marking food as eaten');
        setFoodParticles(prev =>
          prev.map(particle => {
            if (newFoodBeingEaten.has(particle.id)) {
              console.log(`Marking particle ${particle.id} as eaten`);
              return { ...particle, eaten: true };
            }
            return particle;
          })
        );
        setFoodBeingEaten(new Set());
        setSquidExpression('content');

        // Update satiety for each food particle eaten
        const satietyGain = (() => {
          if (satiety.level <= 3) return 20;
          if (satiety.level <= 6) return 15;
          if (satiety.level <= 8) return 10;
          return 8;
        })();

        setSatiety(prev => ({
          ...prev,
          current: Math.min(prev.current + (satietyGain * availableFood.length), prev.max)
        }));
      }, ANIMATION.EATING_DURATION);
    }
  }, [clickCount, foodParticles, foodBeingEaten, squidExpression, satiety.level]);

  // Update squid form opacity when click count changes
  useEffect(() => {
    if (clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION) {
      setSquidFormOpacity(1);
    }
  }, [clickCount]);

  // Main cell container
  return (
    <div
      ref={gameRef}
      data-game-container="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#1a1a1a',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={handleClick}
    >
      {/* Developer Controls - Fixed positioning */}
      {FEATURE_FLAGS.DEVELOPMENT && showDevTools && (
        <div
          data-dev-area="true"
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(74, 144, 226, 0.3)',
          }}
        >
          <button
            data-dev-area="true"
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
              userSelect: 'none',
            }}
          >
            Click Multiplier: x{clickMultiplier.toLocaleString()}
          </button>

          {/* Click Reduction Controls */}
          <div
            data-dev-area="true"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '5px',
            }}
          >
            <div
              data-dev-area="true"
              style={{
                color: '#4a90e2',
                fontSize: '14px',
                marginBottom: '5px',
              }}
            >
              Reduce Clicks
            </div>
            <div
              data-dev-area="true"
              style={{
                display: 'flex',
                gap: '5px',
                flexWrap: 'wrap',
              }}
            >
              {[100, 1000, 10000, 100000].map((amount) => (
                <button
                  key={amount}
                  data-dev-area="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setClickCount(prev => Math.max(0, prev - amount));
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    color: '#ffffff',
                    background: 'rgba(74, 144, 226, 0.3)',
                    border: '1px solid #4a90e2',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-out',
                    userSelect: 'none',
                  }}
                >
                  -{amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Logging Control Checkboxes */}
          <div
            data-dev-area="true"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '10px',
              background: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '5px',
            }}
          >
            <label
              data-dev-area="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4a90e2',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                data-dev-area="true"
                type="checkbox"
                checked={loggingPreferences.squid}
                onChange={(e) => {
                  e.stopPropagation();
                  setLoggingPreferences(prev => ({
                    ...prev,
                    squid: e.target.checked
                  }));
                }}
                style={{ cursor: 'pointer' }}
              />
              Squid
            </label>
            <label
              data-dev-area="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4a90e2',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                data-dev-area="true"
                type="checkbox"
                checked={loggingPreferences.foodParticles}
                onChange={(e) => {
                  e.stopPropagation();
                  setLoggingPreferences(prev => ({
                    ...prev,
                    foodParticles: e.target.checked
                  }));
                }}
                style={{ cursor: 'pointer' }}
              />
              Food Particles
            </label>
          </div>

          {/* Developer Logs Display */}
          <div
            data-dev-area="true"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              padding: '10px',
              borderRadius: '5px',
              maxHeight: '200px',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#4a90e2',
              border: '1px solid rgba(74, 144, 226, 0.3)',
              width: '300px',
            }}
          >
            {Object.entries(objectLogs).map(([id, log]) => (
              <div key={id} style={{ marginBottom: '4px' }}>
                {log.timestamp}: {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click counter */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '1.1em',
          textShadow: '0 0 10px rgba(74, 144, 226, 0.5)',
          border: '1px solid rgba(74, 144, 226, 0.3)',
          boxShadow: '0 0 10px rgba(74, 144, 226, 0.2)',
          zIndex: 1001 // Ensure it's above the store
        }}
      >
        Clicks: {clickCount}
      </div>

      {/* Store - will only render when there are available items */}
      <div data-store-area="true">
        <Store
          items={STORE_ITEMS}
          clickCount={clickCount}
          clickBonus={clickBonus}
          clickMultiplier={clickMultiplier}
          purchasedItems={purchasedItems}
          onPurchase={handleStorePurchase}
        />
      </div>

      {/* Purchased Items List */}
      <PurchasedItems
        items={STORE_ITEMS}
        purchasedItems={purchasedItems}
      />

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
        <FoodParticleComponent key={particle.id} particle={particle} />
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

      {/* Internal cell parts for auto-clickers */}
      {internalParts.map((part) => (
        <div
          key={part.id}
          className="internal-part"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '40px',
            height: '40px',
            transform: `translate(-50%, -50%) rotate(${part.rotation}deg) translateY(-30px)`,
            opacity: 0.9,
            zIndex: clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION ? 1 : 2, // Behind squid face in squid phase, in front in cell phase
            pointerEvents: 'none', // Ensure it doesn't interfere with clicks
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(74, 144, 226, 0.5))',
              visibility: clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION ? 'visible' : 'visible', // Always visible
            }}
          >
            {/* Core element */}
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="url(#autoClickerCore)"
              style={{
                animation: 'autoClickerPulse 2s infinite ease-in-out',
              }}
            />

            {/* Glowing ring */}
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="url(#autoClickerGlow)"
              strokeWidth="3"
              style={{
                animation: 'autoClickerGlow 2s infinite ease-in-out',
              }}
            />

            {/* Rotating gear structure */}
            <g
              style={{
                animation: 'autoClickerRotate 4s linear infinite',
                transformOrigin: '50% 50%',
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * Math.PI * 2) / 8;
                const x1 = 50 + Math.cos(angle) * 15;
                const y1 = 50 + Math.sin(angle) * 15;
                const x2 = 50 + Math.cos(angle) * 30;
                const y2 = 50 + Math.sin(angle) * 30;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#4a90e2"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>

            {/* Orbiting particles */}
            {Array.from({ length: 3 }).map((_, i) => {
              const angle = (time * 2 + (i * Math.PI * 2) / 3) % (Math.PI * 2);
              const x = 50 + Math.cos(angle) * 35;
              const y = 50 + Math.sin(angle) * 35;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="url(#autoClickerParticle)"
                  style={{
                    animation: 'autoClickerParticleEmit 1s infinite ease-in-out',
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              );
            })}
          </svg>
        </div>
      ))}

      {/* SquidForm - single source of truth */}
      {clickCount >= CLICK_THRESHOLDS.SQUID_TRANSFORMATION && (
        <div style={{
          position: 'absolute',
          left: `${squidPosition.x}%`,
          top: `${squidPosition.y}%`,
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          opacity: squidFormOpacity,
          transition: 'opacity 0.5s ease-in-out',
          zIndex: 2, // Ensure squid is above auto-clicker parts
        }}>
          <SquidForm
            isBlinking={isSquidBlinking}
            isHappy={squidMood.isHappy}
            expression={squidExpression}
            scale={1}
            satiety={satiety}
            onSatietyLevelUp={handleSatietyLevelUp}
          />
        </div>
      )}
    </div>
  );
};

// Add the pulse animation to your CSS
const styles = `
@keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 0.4; }
    100% { opacity: 0.8; }
}
`;

export default Game;