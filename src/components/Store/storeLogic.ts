import { StoreItem } from '../../constants/storeItems';

export interface StoreState {
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    purchasedItems: { [key: string]: number };
}

export const handlePurchase = (
    item: StoreItem,
    state: StoreState
): Partial<StoreState> => {
    const currentLevel = state.purchasedItems[item.id] || 0;
    const nextLevel = item.levels[currentLevel];

    if (!nextLevel) {
        throw new Error('Item is at max level');
    }

    if (state.clickCount < nextLevel.cost) {
        throw new Error('Not enough clicks');
    }

    // Calculate new state
    const newState: Partial<StoreState> = {
        clickCount: state.clickCount - nextLevel.cost,
        purchasedItems: {
            ...state.purchasedItems,
            [item.id]: currentLevel + 1
        }
    };

    // Apply effect based on type
    if (nextLevel.effect.type === 'additive') {
        newState.clickBonus = state.clickBonus + nextLevel.effect.value;
    } else if (nextLevel.effect.type === 'multiplicative') {
        newState.clickMultiplier = state.clickMultiplier * nextLevel.effect.value;
    }

    return newState;
};