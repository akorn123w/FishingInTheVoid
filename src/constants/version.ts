import { encodeVersion } from '../utils/versionUtils';

// Current version of the game
export const CURRENT_VERSION = encodeVersion({
    major: 0,
    minor: 0,
    patch: 0,
    meta: 'pre-release'
});