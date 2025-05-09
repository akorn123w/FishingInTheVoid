import { StoreItem } from '../../constants/storeItems';

interface StoreState {
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    temporaryMultiplier: number;
    purchasedItems: { [key: string]: number };
}

interface StoreCallbacks {
    setClickCount: (value: number | ((prev: number) => number)) => void;
    setClickBonus: (value: number | ((prev: number) => number)) => void;
    setClickMultiplier: (value: number | ((prev: number) => number)) => void;
    setTemporaryMultiplier: (value: number) => void;
    setPurchasedItems: (value: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number })) => void;
    setTemporaryMultiplierTimeout: (timeout: NodeJS.Timeout | null) => void;
}

export const handlePurchase = (
    item: StoreItem,
    state: StoreState,
    callbacks: StoreCallbacks,
    temporaryMultiplierTimeout: NodeJS.Timeout | null
) => {
    // Calculate the actual cost based on current level
    const currentLevel = state.purchasedItems[item.id] || 0;
    const actualCost = item.cost + (item.costPerLevel ? item.costPerLevel * currentLevel : 0);

    if (state.clickCount >= actualCost) {
        callbacks.setClickCount(prev => prev - actualCost);

        // Update purchased items
        callbacks.setPurchasedItems(prev => ({
            ...prev,
            [item.id]: (prev[item.id] || 0) + 1
        }));

        // Apply item effects based on type
        switch (item.type) {
            case 'additive':
                callbacks.setClickBonus(prev => prev + item.effect.value);
                break;
            case 'multiplier':
                callbacks.setClickMultiplier(prev => prev * item.effect.value);
                break;
            case 'boost':
                if (item.effect.type === 'temporary_multiplier') {
                    // Clear any existing temporary multiplier
                    if (temporaryMultiplierTimeout) {
                        clearTimeout(temporaryMultiplierTimeout);
                    }
                    callbacks.setTemporaryMultiplier(item.effect.value);
                    const timeout = setTimeout(() => {
                        callbacks.setTemporaryMultiplier(1);
                    }, 30000); // 30 seconds
                    callbacks.setTemporaryMultiplierTimeout(timeout);
                }
                break;
            case 'ability':
                // Handle ability effects
                switch (item.effect.type) {
                    case 'division_frequency':
                        // Handle cell division frequency boost
                        break;
                    case 'squid_speed':
                        // Handle squid speed boost
                        break;
                }
                break;
        }
    }
};