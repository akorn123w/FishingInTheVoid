export interface StoreItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    costPerLevel?: number;
    unlockAtClicks: number;
    type: 'additive' | 'multiplier' | 'boost' | 'visual' | 'ability';
    effect: {
        type: string;
        value: number;
    };
    maxLevel?: number;
    currentLevel?: number;
}

export const STORE_ITEMS: StoreItem[] = [
    {
        id: 'click_plus_one',
        name: 'Click Plus One',
        description: 'Each click gives +1 additional click',
        cost: 50,
        costPerLevel: 10,
        unlockAtClicks: 50,
        type: 'additive',
        effect: {
            type: 'click_bonus',
            value: 1
        },
        maxLevel: 3
    },
    {
        id: 'click_plus_two',
        name: 'Click Plus Two',
        description: 'Each click gives +2 additional clicks',
        cost: 150,
        unlockAtClicks: 150,
        type: 'additive',
        effect: {
            type: 'click_bonus',
            value: 2
        },
        maxLevel: 2
    },
    {
        id: 'basic_multiplier',
        name: 'Basic Multiplier',
        description: 'Double your total clicks',
        cost: 300,
        unlockAtClicks: 300,
        type: 'multiplier',
        effect: {
            type: 'click_multiplier',
            value: 2
        },
        maxLevel: 3
    },
    {
        id: 'advanced_multiplier',
        name: 'Advanced Multiplier',
        description: 'Triple your total clicks',
        cost: 1000,
        unlockAtClicks: 1000,
        type: 'multiplier',
        effect: {
            type: 'click_multiplier',
            value: 3
        },
        maxLevel: 2
    },
    {
        id: 'super_multiplier',
        name: 'Super Multiplier',
        description: 'Multiply your total clicks by 5',
        cost: 5000,
        unlockAtClicks: 2000,
        type: 'multiplier',
        effect: {
            type: 'click_multiplier',
            value: 5
        },
        maxLevel: 1
    },
    {
        id: 'temporary_boost',
        name: 'Temporary Boost',
        description: 'Double your clicks for 30 seconds',
        cost: 100,
        unlockAtClicks: 100,
        type: 'boost',
        effect: {
            type: 'temporary_multiplier',
            value: 2
        }
    },
    {
        id: 'cell_division_boost',
        name: 'Cell Division Boost',
        description: 'Cells divide more frequently',
        cost: 150,
        unlockAtClicks: 200,
        type: 'ability',
        effect: {
            type: 'division_frequency',
            value: 0.5
        }
    },
    {
        id: 'squid_speed_boost',
        name: 'Squid Speed Boost',
        description: 'Increase squid movement speed',
        cost: 300,
        unlockAtClicks: 400,
        type: 'ability',
        effect: {
            type: 'squid_speed',
            value: 1.5
        }
    }
];