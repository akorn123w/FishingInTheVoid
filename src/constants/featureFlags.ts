// Environment variables are prefixed with VITE_ to be exposed to the client
const isDev = import.meta.env.VITE_IS_DEV === 'true';
const enableDevTools = import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
const enableDevFeatures = import.meta.env.VITE_ENABLE_DEV_FEATURES === 'true';

export const FEATURE_FLAGS = {
    // Development features
    DEVELOPMENT: isDev,
    DEV_TOOLS: enableDevTools,
    DEV_FEATURES: enableDevFeatures,

    // Game features that should be available in both modes
    GAME_FEATURES: {
        SOUND: true,
        MUSIC: true,
        SAVE_GAME: true,
    },

    // Debug features (only in development)
    DEBUG: {
        SHOW_FPS: isDev,
        SHOW_COLLIDERS: isDev,
        SHOW_DEBUG_INFO: isDev,
    }
} as const;

// Type for the feature flags
export type FeatureFlags = typeof FEATURE_FLAGS;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
    return FEATURE_FLAGS[feature] === true;
};

// Helper function to check if a debug feature is enabled
export const isDebugFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS.DEBUG): boolean => {
    return FEATURE_FLAGS.DEBUG[feature] === true;
};