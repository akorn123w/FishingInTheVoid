// Version utility functions for comparing versions

interface Version {
    major: number;
    minor: number;
    patch: number;
    meta?: string;
}

// Encode a version object to a string
export const encodeVersion = (version: Version): string => {
    const meta = version.meta ? `-${version.meta}` : '';
    return `${version.major}.${version.minor}.${version.patch}${meta}`;
};

// Decode a version string back to a version object
export const decodeVersion = (versionStr: string): Version => {
    // Split on the first occurrence of '-'
    const dashIndex = versionStr.indexOf('-');
    const version = dashIndex === -1 ? versionStr : versionStr.substring(0, dashIndex);
    const meta = dashIndex === -1 ? undefined : versionStr.substring(dashIndex + 1);

    const [major, minor, patch] = version.split('.').map(Number);

    return {
        major,
        minor,
        patch,
        meta
    };
};

// Compare two versions
export const compareVersions = (v1: Version, v2: Version): number => {
    // First compare numeric versions
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    if (v1.patch !== v2.patch) return v1.patch - v2.patch;

    // If numeric versions are equal, compare metadata
    if (v1.meta === v2.meta) return 0;

    // If one version has metadata and the other doesn't, the one without metadata is newer
    if (!v1.meta) return 1;
    if (!v2.meta) return -1;

    // If both have metadata, compare them
    return v1.meta.localeCompare(v2.meta);
};

// Check if a version is outdated compared to another
export const isVersionOutdated = (current: Version, latest: Version): boolean => {
    return compareVersions(current, latest) < 0;
};