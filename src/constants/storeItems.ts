export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface StoreItemLevel {
    level: number;
    rarity: ItemRarity;
    cost: number;
    effect: {
        type: 'additive' | 'multiplicative';
        value: number;
    };
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    unlockAtClicks: number;
    maxLevel: number;
    levels: StoreItemLevel[];
}

// Helper function to create store item levels
const createLevels = (
    baseCost: number,
    costMultiplier: number,
    baseEffect: number,
    effectMultiplier: number,
    maxLevel: number,
    rarityProgression: ItemRarity[]
): StoreItemLevel[] => {
    return Array.from({ length: maxLevel }, (_, i) => ({
        level: i + 1,
        rarity: rarityProgression[i] || 'common',
        cost: Math.floor(baseCost * Math.pow(costMultiplier, i)),
        effect: {
            type: 'additive',
            value: baseEffect + (effectMultiplier * i)
        }
    }));
};

// Initial store items
export const STORE_ITEMS: StoreItem[] = [
    {
        id: 'click_plus',
        name: 'Click+',
        description: 'Each click gives additional clicks',
        unlockAtClicks: 50,
        maxLevel: 5,
        levels: createLevels(
            50,    // Base cost
            1.5,   // Cost multiplier per level
            1,     // Base effect (additional clicks)
            1,     // Effect multiplier per level
            5,     // Max level
            ['common', 'common', 'uncommon', 'rare', 'epic'] // Rarity progression
        )
    },
    {
        id: 'click_multiplier',
        name: 'Click Multiplier',
        description: 'Multiply your total clicks',
        unlockAtClicks: 300,
        maxLevel: 3,
        levels: createLevels(
            300,   // Base cost
            2,     // Cost multiplier per level
            1.5,   // Base effect (multiplier) - reduced from 2
            0.5,   // Effect multiplier per level - reduced from 1
            3,     // Max level
            ['uncommon', 'rare', 'epic'] // Rarity progression
        ).map(level => ({
            ...level,
            effect: {
                type: 'multiplicative',
                value: level.effect.value
            }
        }))
    },
    {
        id: 'auto_click',
        name: 'Auto-Click',
        description: 'Automatically generates clicks every 2 seconds',
        unlockAtClicks: 1000,
        maxLevel: 5,
        levels: createLevels(
            1000,  // Base cost
            2,     // Cost multiplier per level
            1,     // Base effect (1 auto-clicker)
            1,     // Effect multiplier per level (adds 1 auto-clicker per level)
            5,     // Max level
            ['rare', 'rare', 'epic', 'epic', 'legendary'] // Rarity progression
        )
    }
];