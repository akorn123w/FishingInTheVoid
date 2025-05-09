import { StoreItem } from '../constants/storeItems';
import { AbstractHandler, HandlerState, HandlerCallbacks } from './BaseHandler';

interface StoreHandlerState extends HandlerState {
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    temporaryMultiplier: number;
    purchasedItems: { [key: string]: number };
}

interface StoreHandlerCallbacks extends HandlerCallbacks {
    setClickCount: (value: number | ((prev: number) => number)) => void;
    setClickBonus: (value: number | ((prev: number) => number)) => void;
    setClickMultiplier: (value: number | ((prev: number) => number)) => void;
    setTemporaryMultiplier: (value: number) => void;
    setPurchasedItems: (value: { [key: string]: number } | ((prev: { [key: string]: number }) => { [key: string]: number })) => void;
    setTemporaryMultiplierTimeout: (timeout: NodeJS.Timeout | null) => void;
}

export class StoreHandler extends AbstractHandler {
    private storeCallbacks: StoreHandlerCallbacks;
    private temporaryMultiplierTimeout: NodeJS.Timeout | null;

    constructor(
        initialState: Partial<StoreHandlerState>,
        callbacks: StoreHandlerCallbacks
    ) {
        super(initialState, callbacks);
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

    handleEvent(item: StoreItem): void {
        if (!this.state.isActive) {
            this.callbacks.onError(new Error('Store handler is not active'));
            return;
        }

        const state = this.getState() as StoreHandlerState;

        // Calculate the actual cost based on current level
        const currentLevel = state.purchasedItems[item.id] || 0;
        const actualCost = item.cost + (item.costPerLevel ? item.costPerLevel * currentLevel : 0);

        if (state.clickCount >= actualCost) {
            this.storeCallbacks.setClickCount(prev => prev - actualCost);

            // Update purchased items
            this.storeCallbacks.setPurchasedItems(prev => ({
                ...prev,
                [item.id]: (prev[item.id] || 0) + 1
            }));

            // Apply item effects based on type
            switch (item.type) {
                case 'additive':
                    this.storeCallbacks.setClickBonus(prev => prev + item.effect.value);
                    break;
                case 'multiplier':
                    this.storeCallbacks.setClickMultiplier(prev => prev * item.effect.value);
                    break;
                case 'boost':
                    if (item.effect.type === 'temporary_multiplier') {
                        // Clear any existing temporary multiplier
                        if (this.temporaryMultiplierTimeout) {
                            clearTimeout(this.temporaryMultiplierTimeout);
                        }
                        this.storeCallbacks.setTemporaryMultiplier(item.effect.value);
                        const timeout = setTimeout(() => {
                            this.storeCallbacks.setTemporaryMultiplier(1);
                        }, 30000); // 30 seconds
                        this.storeCallbacks.setTemporaryMultiplierTimeout(timeout);
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

            // Update handler state
            this.updateState({
                timestamp: Date.now()
            });
        }
    }

    cleanup(): void {
        super.cleanup();
        if (this.temporaryMultiplierTimeout) {
            clearTimeout(this.temporaryMultiplierTimeout);
            this.temporaryMultiplierTimeout = null;
        }
    }
}