import React from 'react';
import { checkVersion } from '../services/versionCheck';

interface VersionCheckProps {
    children: React.ReactNode;
}

export const VersionCheck: React.FC<VersionCheckProps> = ({ children }) => {
    const [isChecking, setIsChecking] = React.useState(true);
    const [showOutdated, setShowOutdated] = React.useState(false);
    const [versionInfo, setVersionInfo] = React.useState<{
        currentVersion: string;
        latestVersion: string;
        error?: string;
    } | null>(null);

    React.useEffect(() => {
        const checkVersionOnLoad = async () => {
            try {
                console.log('Checking version...');
                const result = await checkVersion();
                console.log('Version check result:', result);

                if (result.isOutdated || result.error) {
                    console.log('Version is outdated or error occurred:', result.error);
                    setShowOutdated(true);
                    setVersionInfo({
                        currentVersion: result.currentVersion,
                        latestVersion: result.latestVersion,
                        error: result.error
                    });
                } else {
                    console.log('Version is up to date');
                }
            } catch (error) {
                console.error('Error during version check:', error);
                setShowOutdated(true);
                setVersionInfo({
                    currentVersion: 'unknown',
                    latestVersion: 'unknown',
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            } finally {
                setIsChecking(false);
            }
        };

        checkVersionOnLoad();
    }, []);

    const handleClose = () => {
        window.close(); // Close the app
    };

    if (isChecking) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <h2>Checking Version...</h2>
                </div>
            </div>
        );
    }

    if (showOutdated) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <h2 style={{ color: '#ff4444', marginBottom: '1rem' }}>
                        {versionInfo?.error ? 'Error' : 'Version Outdated'}
                    </h2>
                    {versionInfo?.error ? (
                        <p style={{ marginBottom: '1rem', color: '#ff4444' }}>
                            {versionInfo.error}
                        </p>
                    ) : (
                        <p style={{ marginBottom: '1rem' }}>
                            Your version ({versionInfo?.currentVersion}) is outdated.
                            <br />
                            Please update to version {versionInfo?.latestVersion}
                        </p>
                    )}
                    <button
                        onClick={handleClose}
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '0.5rem 2rem',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    }

    // Only render children if version is up to date
    return <>{children}</>;
};