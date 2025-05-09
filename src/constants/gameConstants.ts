// Game progression thresholds
export const CLICK_THRESHOLDS = {
    CLICK_COOLDOWN: 50,
    INITIAL: 1,
    PRE_EVOLUTION_START: 9800,
    PRE_EVOLUTION_END: 10000,
    POST_EVOLUTION_START: 10000,
    CELL_DIVISION_END: 10050,
    SQUID_TRANSFORMATION: 10100,
} as const;

// Cell division settings
export const CELL_DIVISION = {
    CLICKS_PER_DIVISION: 10,
    BASE_DISTANCE: 60,
    GENERATION_MULTIPLIER: 1.2,
    CELL_COUNT_MULTIPLIER: 0.5,
    CELL_DIAMETER: 45,
    OVERLAP: 0.2,
} as const;

// Animation settings
export const ANIMATION = {
    DIVISION_DURATION: 1000,
    BLINK_DURATION: 100,
    BLINK_CHANCE: 0.1,
    BLINK_CHECK_INTERVAL: 100,
    MOVEMENT_INTERVAL: 16,
    PARTICLE_INTERVAL: 50,
    FOOD_FADE_START: 5000,
    FOOD_FADE_DURATION: 2000,
    FOOD_REMOVE_AFTER: 7000,
    EATING_CHECK_INTERVAL: 100,
    EATING_DURATION: 2000,
    EATING_SWIRL_DURATION: 1500,
    EATING_SHAKE_INTENSITY: 0.1,
} as const;

// Movement settings
export const MOVEMENT = {
    SQUID_SPEED: 0.5,
    SQUID_IDLE_SPEED: 0.3,
    SQUID_VELOCITY_DAMPING: 0.9,
    SQUID_VELOCITY_INFLUENCE: 0.1,
    FOOD_DETECTION_RADIUS: 20,
    CENTER_THRESHOLD: 2,
} as const;

// Particle settings
export const PARTICLES = {
    INITIAL_COUNT: 50,
    MIN_SIZE: 1,
    MAX_SIZE: 4,
    MIN_SPEED: 0.1,
    MAX_SPEED: 0.3,
    PUSH_DECAY: 0.92,
} as const;

// Food settings
export const FOOD = {
    MIN_SIZE: 4,
    MAX_SIZE: 8,
    TYPES: 4,
    MAX_PARTICLES: 2000,
} as const;

// Background cell settings
export const BACKGROUND = {
    CELL_COUNT: 20,
    MIN_SPEED: 0.05,
    MAX_SPEED: 0.15,
    MAX_OPACITY: 0.6,
    OPACITY_INCREMENT: 0.01,
} as const;

// Spring physics
export const SPRING = {
    STIFFNESS: 0.18,
    DAMPING: 0.8,
} as const;