import { StoreItem } from '../constants/storeItems';
import { AbstractHandler, HandlerState, HandlerCallbacks } from './BaseHandler';

export interface StoreHandlerState extends HandlerState {
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    temporaryMultiplier: number;
    purchasedItems: { [key: string]: number };
    autoClickers?: number;
}

interface StoreHandlerCallbacks extends HandlerCallbacks {
    setClickCount: (value: number | ((prev: number) => number)) => void;
    setClickBonus: (value: number | ((prev: number) => number)) => void;
    setClickMultiplier: (value: number | ((prev: number) => number)) => void;
    setTemporaryMultiplier: (value: number) => void;
    setPurchasedItems: (value: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number })) => void;
    setTemporaryMultiplierTimeout: (timeout: NodeJS.Timeout | null) => void;
    setAutoClickers: (value: number | ((prev: number) => number)) => void;
}

export class StoreHandler extends AbstractHandler {
    private storeCallbacks: StoreHandlerCallbacks;
    private temporaryMultiplierTimeout: NodeJS.Timeout | null;

    constructor(callbacks: StoreHandlerCallbacks) {
        super({ isActive: true }, callbacks);
        this.storeCallbacks = callbacks;
        this.temporaryMultiplierTimeout = null;
    }

    // Add method to update handler state from component state
    updateHandlerState(newState: Partial<StoreHandlerState>): void {
        this.state = {
            ...this.state,
            ...newState
        };
    }

    handleEvent(item: StoreItem): Partial<StoreHandlerState> {
        if (!this.state.isActive) {
            this.callbacks.onError(new Error('Store handler is not active'));
            return {};
        }

        const state = this.getState() as StoreHandlerState;
        const currentLevel = state.purchasedItems[item.id] || 0;
        const nextLevel = item.levels[currentLevel];

        if (!nextLevel) {
            this.callbacks.onError(new Error('Item is at max level'));
            return {};
        }

        if (state.clickCount < nextLevel.cost) {
            this.callbacks.onError(new Error('Not enough clicks'));
            return {};
        }

        // Update click count
        this.storeCallbacks.setClickCount(prev => prev - nextLevel.cost);

        // Update purchased items
        this.storeCallbacks.setPurchasedItems(prev => ({
            ...prev,
            [item.id]: currentLevel + 1
        }));

        const newState: Partial<StoreHandlerState> = {
            clickCount: state.clickCount - nextLevel.cost,
            purchasedItems: {
                ...state.purchasedItems,
                [item.id]: currentLevel + 1
            }
        };

        // Apply effect based on type
        if (nextLevel.effect.type === 'additive') {
            if (item.id === 'auto_click') {
                const newAutoClickers = (state.autoClickers || 0) + nextLevel.effect.value;
                this.storeCallbacks.setAutoClickers(() => newAutoClickers);
                newState.autoClickers = newAutoClickers;
            } else {
                this.storeCallbacks.setClickBonus(prev => prev + nextLevel.effect.value);
                newState.clickBonus = state.clickBonus + nextLevel.effect.value;
            }
        } else if (nextLevel.effect.type === 'multiplicative') {
            this.storeCallbacks.setClickMultiplier(prev => prev * nextLevel.effect.value);
            newState.clickMultiplier = state.clickMultiplier * nextLevel.effect.value;
        }

        // Update handler state
        this.updateState({
            timestamp: Date.now()
        });

        return newState;
    }

    cleanup(): void {
        super.cleanup();
        if (this.temporaryMultiplierTimeout) {
            clearTimeout(this.temporaryMultiplierTimeout);
            this.temporaryMultiplierTimeout = null;
        }
    }
}