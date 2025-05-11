// Game progression thresholds
export const CLICK_THRESHOLDS = {
    CLICK_COOLDOWN: 50,        // Minimum milliseconds between clicks
    INITIAL: 1,                // Starting click count
    PRE_EVOLUTION_START: 9800, // When cell starts preparing for evolution
    PRE_EVOLUTION_END: 10000,  // When cell finishes pre-evolution phase
    POST_EVOLUTION_START: 10000, // When cell enters post-evolution phase
    CELL_DIVISION_END: 10050,  // When cell division phase ends
    SQUID_TRANSFORMATION: 10100, // When cell transforms into squid
} as const;

// Cell division settings
export const CELL_DIVISION = {
    CLICKS_PER_DIVISION: 10,   // Clicks needed to trigger cell division
    BASE_DISTANCE: 60,         // Base distance between divided cells
    GENERATION_MULTIPLIER: 1.2, // How much further each generation spreads
    CELL_COUNT_MULTIPLIER: 0.5, // How much more cells spread with more cells
    CELL_DIAMETER: 45,         // Size of each cell
    OVERLAP: 0.2,             // How much cells overlap when dividing
} as const;

// Animation settings
export const ANIMATION = {
    DIVISION_DURATION: 1000,   // How long cell division animation takes
    BLINK_DURATION: 100,       // How long squid blinks for
    BLINK_CHANCE: 0.1,         // Probability of squid blinking each check
    BLINK_CHECK_INTERVAL: 100, // How often to check for blinking
    PARTICLE_INTERVAL: 50,     // How often to update background particles
    FOOD_FADE_START: 5000,     // When food starts fading out
    FOOD_FADE_DURATION: 2000,  // How long food takes to fade out
    FOOD_REMOVE_AFTER: 7000,   // When to remove faded food
    EATING_CHECK_INTERVAL: 100, // How often to check for food to eat
    EATING_DURATION: 2000,     // How long eating animation takes
    EATING_SWIRL_DURATION: 1500, // How long food swirls when being eaten
    EATING_SHAKE_INTENSITY: 0.1, // How much squid shakes while eating
} as const;

// Particle settings
export const PARTICLES = {
    INITIAL_COUNT: 50,         // Number of background particles
    MIN_SIZE: 1,              // Smallest particle size
    MAX_SIZE: 4,              // Largest particle size
    MIN_SPEED: 0.1,           // Slowest particle speed
    MAX_SPEED: 0.3,           // Fastest particle speed
} as const;

// Food settings
export const FOOD = {
    MAX_PARTICLES: 10,         // Maximum number of food particles
    MIN_SIZE: 10,             // Smallest food particle size
    MAX_SIZE: 20,             // Largest food particle size
    TYPES: 4,                 // Number of different food types
    MIN_PARTICLES_FOR_SUCK: 3, // Minimum particles needed to start sucking
} as const;

// Background cell settings
export const BACKGROUND = {
    CELL_COUNT: 20,           // Number of background cells
    MIN_SPEED: 0.05,          // Slowest background cell speed
    MAX_SPEED: 0.15,          // Fastest background cell speed
    MAX_OPACITY: 0.6,         // Maximum opacity of background cells
    OPACITY_INCREMENT: 0.01,  // How quickly background cells fade in
} as const;

// Spring physics
export const SPRING = {
    STIFFNESS: 0.18,          // How rigid the spring movement is
    DAMPING: 0.8,             // How quickly spring movement settles
} as const;