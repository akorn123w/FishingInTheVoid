export const FOOD_PARTICLE = {
    COLORS: {
        1: '#ff6b6b', // Reddish
        2: '#4ecdc4', // Teal
        3: '#ffe66d', // Yellow
        4: '#95e1d3', // Mint
    } as Record<number, string>,
    DEFAULT_COLOR: '#ff6b6b',
    SWIRL_RADIUS: 50, // Max radius of swirl effect
    TARGET_POSITION: {
        x: 50, // Center of the squid
        y: 60, // Mouth position
    }
} as const;