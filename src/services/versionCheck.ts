import { supabase } from '../utils/supabase';
import { CURRENT_VERSION } from '../constants/version';
import { decodeVersion, isVersionOutdated, compareVersions } from '../utils/versionUtils';

interface VersionCheckResult {
    isOutdated: boolean;
    currentVersion: string;
    latestVersion: string;
    error?: string;
}

interface VersionData {
    major: number;
    minor: number;
    patch: number;
    meta: string | null;
}

interface CurrentVersionResponse {
    versions: VersionData;
}

export const checkVersion = async (): Promise<VersionCheckResult> => {
    try {
        // Get the current version from the database using a join
        const { data: currentVersionData, error: currentError } = await supabase
            .from('current_version')
            .select(`
                versions (
                    major,
                    minor,
                    patch,
                    meta
                )
            `)
            .single() as { data: CurrentVersionResponse | null, error: any };

        if (currentError) {
            console.error('Supabase error:', currentError);
            if (currentError.message?.includes('Content Security Policy')) {
                throw new Error('Content Security Policy is blocking Supabase connection. Please check your CSP settings.');
            }
            throw new Error('Failed to fetch current version from database');
        }

        if (!currentVersionData?.versions) {
            throw new Error('No version data found in database');
        }

        // Decode the local version
        const localVersion = decodeVersion(CURRENT_VERSION);
        console.log('Local version:', {
            raw: CURRENT_VERSION,
            decoded: localVersion
        });

        // Create version object from database data
        const dbVersion = {
            major: currentVersionData.versions.major,
            minor: currentVersionData.versions.minor,
            patch: currentVersionData.versions.patch,
            meta: currentVersionData.versions.meta || undefined
        };
        console.log('Database version:', {
            raw: currentVersionData.versions,
            processed: dbVersion
        });

        // Compare versions
        const outdated = isVersionOutdated(localVersion, dbVersion);
        console.log('Version comparison:', {
            local: localVersion,
            db: dbVersion,
            outdated,
            comparison: compareVersions(localVersion, dbVersion)
        });

        return {
            isOutdated: outdated,
            currentVersion: CURRENT_VERSION,
            latestVersion: `${dbVersion.major}.${dbVersion.minor}.${dbVersion.patch}${dbVersion.meta ? `-${dbVersion.meta}` : ''}`
        };
    } catch (error) {
        console.error('Error checking version:', error);
        // If there's an error, we'll show the outdated screen with the error message
        return {
            isOutdated: true, // Show outdated screen on error
            currentVersion: CURRENT_VERSION,
            latestVersion: 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};