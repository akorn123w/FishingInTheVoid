export const GAME = {
    INITIAL_STATE: {
        clickCount: 0,
        clickBonus: 0,
        clickMultiplier: 1,
        temporaryMultiplier: 1,
        particles: [],
        foodParticles: [],
        floatingNumbers: [],
        cells: [],
        backgroundCells: [],
        squidExpression: 'content' as const,
        foodBeingEaten: new Set<number>(),
        cellDivision: false,
        squidFormOpacity: 0,
        showSquidForm: false
    },
    FLOATING_NUMBER: {
        DURATION: 500,
        FADE_DURATION: 50,
        MOVE_DISTANCE: 10
    }
} as const;