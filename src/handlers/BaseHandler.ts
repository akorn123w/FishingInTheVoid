export interface HandlerState {
    // Base state that all handlers might need
    timestamp: number;
    isActive: boolean;
}

export interface HandlerCallbacks {
    // Base callbacks that all handlers might need
    onStateChange: (newState: Partial<HandlerState>) => void;
    onError: (error: Error) => void;
}

export interface BaseHandler {
    // Common methods all handlers should implement
    initialize(): void;
    cleanup(): void;
    handleEvent(event: any): void;
    getState(): HandlerState;
    updateState(newState: Partial<HandlerState>): void;
}

// Abstract base class that implements common handler functionality
export abstract class AbstractHandler implements BaseHandler {
    protected state: HandlerState;
    protected callbacks: HandlerCallbacks;

    constructor(initialState: Partial<HandlerState>, callbacks: HandlerCallbacks) {
        this.state = {
            timestamp: Date.now(),
            isActive: true,
            ...initialState
        };
        this.callbacks = callbacks;
    }

    initialize(): void {
        this.state.isActive = true;
        this.state.timestamp = Date.now();
    }

    cleanup(): void {
        this.state.isActive = false;
    }

    abstract handleEvent(event: any): void;

    getState(): HandlerState {
        return { ...this.state };
    }

    updateState(newState: Partial<HandlerState>): void {
        this.state = {
            ...this.state,
            ...newState
        };
        this.callbacks.onStateChange(newState);
    }
}