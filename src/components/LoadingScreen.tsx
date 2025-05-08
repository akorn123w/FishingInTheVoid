import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#1a1a1a',
                color: '#ffffff',
            }}
        >
            <div
                style={{
                    fontSize: '2rem',
                    textShadow: '0 0 20px rgba(74, 144, 226, 0.8)',
                }}
            >
                Loading...
            </div>
        </div>
    );
};

export default LoadingScreen;